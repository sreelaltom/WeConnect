from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Annotated, List


from .. import models, schemas, auth
from ..database import get_db
from ..exceptions import (
    raise_not_found_exception,
    raise_bad_request_exception,
    raise_conflict_exception,
)
from ..auth import get_current_user, verify_password, create_access_token, get_password_hash

router = APIRouter(
    prefix="/users",
    tags=["users"],
)

db_dependency = Annotated[Session, Depends(get_db)]


@router.post("/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if db_user:
        raise_conflict_exception("Username already registered")
    
    # Hash the password here
    hashed_password = get_password_hash(user.password)

    new_user = models.User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password  # This must NOT be None
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user
@router.get("/", response_model=List[schemas.UserWithFollowers])
def get_all_users(
    db: db_dependency,
    current_user: models.User = Depends(auth.get_current_user),
):
    users = db.query(models.User).filter(models.User.id != current_user.id).all()

    response = []
    for user in users:
        response.append(
            schemas.UserWithFollowers(
                id=user.id,
                username=user.username,
                followers_count=len(user.followers),
                is_following=current_user in user.followers
            )
        )
    return response


@router.post("/{user_id}/follow", status_code=204)
def follow_user(
    user_id: int,
    db: db_dependency,
    current_user: models.User = Depends(auth.get_current_user),
):
    """
    Follow a user by ID if not already followed.
    Cannot follow yourself.
    """
    user_to_follow = db.query(models.User).filter_by(id=user_id).first()
    if not user_to_follow:
        raise_not_found_exception("User not found")
    if user_to_follow == current_user:
        raise_bad_request_exception("Cannot follow yourself")
    if user_to_follow in current_user.following:
        raise_bad_request_exception("Already following this user")
    current_user.following.append(user_to_follow)
    db.commit()


@router.post("/{user_id}/unfollow", status_code=204)
def unfollow_user(
    user_id: int,
    db: db_dependency,
    current_user: models.User = Depends(auth.get_current_user),
):
    """
    Unfollow a user by ID if currently followed.
    Cannot unfollow yourself.
    """
    user_to_unfollow = db.query(models.User).filter_by(id=user_id).first()
    if not user_to_unfollow:
        raise_not_found_exception("User not found")
    if user_to_unfollow == current_user:
        raise_bad_request_exception("Cannot unfollow yourself")
    if user_to_unfollow not in current_user.following:
        raise_bad_request_exception("Not following this user")
    current_user.following.remove(user_to_unfollow)
    db.commit()

@router.get("/me", response_model=schemas.UserProfile)
def read_users_me(
    current_user: models.User = Depends(get_current_user)
):
    return {
        "id": current_user.id,
        "username": current_user.username,
        "followers_count": len(current_user.followers),
        "following_count": len(current_user.following),
    }
@router.delete("/me", status_code=204)
def delete_my_account(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    user = db.query(models.User).filter(models.User.id == current_user.id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db.delete(user)
    db.commit()
@router.get("/{user_id}/profile", response_model=schemas.UserProfileWithPosts)
def get_user_profile_with_posts(
    user_id: int,
    db: db_dependency,
    current_user: models.User = Depends(auth.get_current_user),
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise_not_found_exception("User not found")

    # Check if the current user is following this user
    is_following = current_user in user.followers

    posts = (
        db.query(models.Post)
        .filter(models.Post.owner_id == user.id)
        .order_by(models.Post.timestamp.desc())
        .all()
    )

    return schemas.UserProfileWithPosts(
        id=user.id,
        username=user.username,
        followers_count=len(user.followers),
        following_count=len(user.following),
        is_following=is_following,
        posts=posts
    )
