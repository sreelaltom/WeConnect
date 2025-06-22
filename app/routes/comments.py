from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List, Annotated
from datetime import datetime, timezone, timedelta

from .. import models, schemas, auth
from ..database import get_db
from .. import exceptions

router = APIRouter(
    prefix="/comments",
    tags=["comments"],
)

db_dependency = Annotated[Session, Depends(get_db)]

@router.get("/{post_id}", response_model=List[schemas.Comment])
def read_comments_for_post(
    post_id: int,
    db: db_dependency,
    skip: int = 0,
    limit: int = 10,
):
    comments = (
        db.query(models.Comment)
        .filter(models.Comment.post_id == post_id)
        .order_by(models.Comment.timestamp.asc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    # Manually build response with owner_username
    result = []
    for comment in comments:
        result.append(schemas.Comment(
            id=comment.id,
            content=comment.content,
            timestamp=comment.timestamp,
            owner_id=comment.owner_id,
            post_id=comment.post_id,
            owner_username=comment.owner.username
        ))
    return result

@router.post("/{post_id}", response_model=schemas.Comment)
def create_comment_for_post(
    post_id: int,
    comment_in: schemas.CommentCreate,
    db: db_dependency,
    current_user: models.User = Depends(auth.get_current_user),
):
    post = db.query(models.Post).filter_by(id=post_id).first()
    if not post:
        exceptions.raise_not_found_exception("Post not found")

    comment = models.Comment(
        content=comment_in.content,
        post_id=post_id,
        owner_id=current_user.id,
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)

    return schemas.Comment(
        id=comment.id,
        content=comment.content,
        timestamp=comment.timestamp,
        owner_id=comment.owner_id,
        post_id=comment.post_id,
        owner_username=current_user.username  # manually added
    )

@router.delete("/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_comment(
    comment_id: int,
    db: db_dependency,
    current_user: models.User = Depends(auth.get_current_user),
):
    comment = db.query(models.Comment).filter_by(id=comment_id).first()
    if not comment:
        exceptions.raise_not_found_exception("Comment not found")
    if comment.owner_id != current_user.id:
        exceptions.raise_forbidden_exception("Not authorized to delete this comment")

    db.delete(comment)
    db.commit()

@router.put("/{comment_id}", response_model=schemas.Comment)
def update_comment(
    comment_id: int,
    comment_update: schemas.CommentCreate,
    db: db_dependency,
    current_user: models.User = Depends(auth.get_current_user),
):
    comment = db.query(models.Comment).filter_by(id=comment_id).first()
    if not comment:
        exceptions.raise_not_found_exception("Comment not found")
    if comment.owner_id != current_user.id:
        exceptions.raise_forbidden_exception("Not authorized to edit this comment")

    time_since_creation = datetime.now(timezone.utc) - comment.timestamp
    if time_since_creation > timedelta(minutes=10):
        exceptions.raise_forbidden_exception("Edit time expired (10 min limit)")

    comment.content = comment_update.content
    db.add(comment)
    db.commit()
    db.refresh(comment)

    return schemas.Comment(
        id=comment.id,
        content=comment.content,
        timestamp=comment.timestamp,
        owner_id=comment.owner_id,
        post_id=comment.post_id,
        owner_username=comment.owner.username  # from relationship
    )
