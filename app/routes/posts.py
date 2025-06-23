from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, select
from typing import List, Annotated
from datetime import timedelta, datetime, timezone
from sqlalchemy.sql import func, exists

from .. import models, schemas, auth
from ..database import get_db
from .. import exceptions

router = APIRouter(
    prefix="/posts",
    tags=["posts"],
)

db_dependency = Annotated[Session, Depends(get_db)]


@router.get("/", response_model=List[schemas.Post])
def read_posts(db: db_dependency, skip: int = 0, limit: int = 10):
    posts = (
        db.query(models.Post)
        .order_by(models.Post.timestamp.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return posts


@router.post("/", response_model=schemas.Post)
def create_new_post(
    post: schemas.PostCreate,
    db: db_dependency,
    current_user: models.User = Depends(auth.get_current_user),
):
    db_post = models.Post(
        title=post.title,  # ✅ NEW: handle title
        content=post.content,
        owner_id=current_user.id
    )
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post


@router.delete("/{post_id}", status_code=204)
def delete_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    post = db.query(models.Post).filter(
        models.Post.id == post_id,
        models.Post.owner_id == current_user.id
    ).first()

    if not post:
        raise HTTPException(status_code=404, detail="Post not found or not yours to delete.")

    db.delete(post)
    db.commit()


@router.post("/{post_id}/like", status_code=status.HTTP_204_NO_CONTENT)
def like_post(
    post_id: int,
    db: db_dependency,
    current_user: models.User = Depends(auth.get_current_user),
):
    post = db.query(models.Post).filter_by(id=post_id).first()
    if post is None:
        exceptions.raise_not_found_exception("Post not found")

    like = db.query(models.Like).filter_by(user_id=current_user.id, post_id=post_id).first()
    if like:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Already liked")

    new_like = models.Like(user_id=current_user.id, post_id=post_id)
    db.add(new_like)
    db.commit()


@router.post("/{post_id}/unlike", status_code=status.HTTP_204_NO_CONTENT)
def unlike_post(
    post_id: int,
    db: db_dependency,
    current_user: models.User = Depends(auth.get_current_user),
):
    like = db.query(models.Like).filter_by(user_id=current_user.id, post_id=post_id).first()
    if not like:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not liked yet")

    db.delete(like)
    db.commit()


@router.get("/mine", response_model=List[schemas.Post])
def read_my_posts(
    db: db_dependency,
    current_user: models.User = Depends(auth.get_current_user),
):
    """
    Get posts only created by the current user.
    """
    posts = (
        db.query(models.Post)
        .filter(models.Post.owner_id == current_user.id)
        .order_by(models.Post.timestamp.desc())
        .all()
    )
    return posts



# -------------------- GET Posts With Counts -------------------- 
@router.get("/with_counts/", response_model=List[schemas.PostWithCounts])
def read_posts_with_counts(
    db: db_dependency,
    skip: int = 0,
    limit: int = 10,
    current_user: models.User = Depends(auth.get_current_user),
):
    likes_subq = (
        db.query(
            models.Like.post_id,
            func.count(models.Like.user_id).label("likes_count")
        )
        .group_by(models.Like.post_id)
        .subquery()
    )

    # ✅ Comment count subquery added here:
    comments_subq = (
        db.query(
            models.Comment.post_id,
            func.count(models.Comment.id).label("comments_count")
        )
        .group_by(models.Comment.post_id)
        .subquery()
    )

    posts = (
        db.query(
            models.Post,
            models.User.username.label("owner_username"),
            func.coalesce(likes_subq.c.likes_count, 0).label("likes_count"),
            func.coalesce(comments_subq.c.comments_count, 0).label("comments_count"),  # ✅ added
            exists().where(
                models.Like.post_id == models.Post.id,
                models.Like.user_id == current_user.id
            ).label("is_liked_by_current_user")
        )
        .join(models.User, models.Post.owner_id == models.User.id)
        .outerjoin(likes_subq, models.Post.id == likes_subq.c.post_id)
        .outerjoin(comments_subq, models.Post.id == comments_subq.c.post_id)  # ✅ added
        .order_by(models.Post.timestamp.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    response_posts = []
    for post, owner_username, likes_count, comments_count, is_liked in posts:
        response_posts.append(
            schemas.PostWithCounts(
                id=post.id,
                title=post.title,
                content=post.content,
                timestamp=post.timestamp,
                owner_id=post.owner_id,
                owner_username=owner_username,
                likes_count=likes_count,
                comments_count=comments_count,  # ✅ return this in schema
                is_liked_by_current_user=is_liked,
            )
        )
    return response_posts

@router.get("/user/{user_id}", response_model=List[schemas.PostWithCounts])
def read_posts_of_user(
    user_id: int,
    db: db_dependency,
    current_user: models.User = Depends(auth.get_current_user),
):
    likes_subq = (
        db.query(
            models.Like.post_id,
            func.count(models.Like.user_id).label("likes_count")
        )
        .group_by(models.Like.post_id)
        .subquery()
    )

    comments_subq = (
        db.query(
            models.Comment.post_id,
            func.count(models.Comment.id).label("comments_count")
        )
        .group_by(models.Comment.post_id)
        .subquery()
    )

    is_liked_subq = (
        select(models.Like)
        .where(models.Like.post_id == models.Post.id)
        .where(models.Like.user_id == current_user.id)
        .exists()
    )

    posts = (
        db.query(
            models.Post,
            models.User.username.label("owner_username"),
            func.coalesce(likes_subq.c.likes_count, 0).label("likes_count"),
            func.coalesce(comments_subq.c.comments_count, 0).label("comments_count"),
            is_liked_subq.label("is_liked_by_current_user")
        )
        .join(models.User, models.Post.owner_id == models.User.id)
        .outerjoin(likes_subq, models.Post.id == likes_subq.c.post_id)
        .outerjoin(comments_subq, models.Post.id == comments_subq.c.post_id)
        .filter(models.Post.owner_id == user_id)  # ✅ Filter by the given user_id
        .order_by(models.Post.timestamp.desc())
        .all()
    )

    response_posts = []
    for post, owner_username, likes_count, comments_count, is_liked in posts:
        response_posts.append(
            schemas.PostWithCounts(
                id=post.id,
                title=post.title,
                content=post.content,
                timestamp=post.timestamp,
                owner_id=post.owner_id,
                owner_username=owner_username,
                likes_count=likes_count,
                comments_count=comments_count,
                is_liked_by_current_user=is_liked,
            )
        )
    return response_posts
