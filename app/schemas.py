from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

# ------------------------ User Schemas ------------------------

class UserBase(BaseModel):
    username: str
    email: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True  # ✅ Needed for ORM support

class UserProfile(BaseModel):
    id: int
    username: str
    followers_count: int
    following_count: int

    class Config:
        from_attributes = True

class UserWithFollowers(BaseModel):
    id: int
    username: str
    followers_count: int
    is_following: bool

    class Config:
        from_attributes = True




# ------------------------ Token Schemas ------------------------

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None


# ------------------------ Post Schemas ------------------------

class PostBase(BaseModel):
    title: str
    content: str

class PostCreate(PostBase):
    pass

class PostUpdate(PostBase):
    pass

class Post(PostBase):
    id: int
    timestamp: datetime
    owner_id: int

    class Config:
        from_attributes = True  # ✅ Required for .from_orm()


class PostWithCounts(Post):
    owner_username: str
    likes_count: int
    comments_count: int 
    retweets_count: int = 0  # default 0 if not using retweets
    is_liked_by_current_user: bool  # ✅ For frontend like button

    class Config:
        from_attributes = True


# ------------------------ Like Schemas ------------------------

class Like(BaseModel):
    user_id: int
    post_id: int

    class Config:
        from_attributes = True


# ------------------------ Retweet Schemas ------------------------

class Retweet(BaseModel):
    user_id: int
    post_id: int
    timestamp: datetime

    class Config:
        from_attributes = True


# ------------------------ Comment Schemas ------------------------

class CommentBase(BaseModel):
    content: str

class CommentCreate(CommentBase):
    pass

class Comment(CommentBase):
    id: int
    owner_id: int
    post_id: int
    timestamp: datetime
    owner_username: str  # ✅ Used in PostCard frontend to show commenter name

    class Config:
        from_attributes = True  # ✅ Important for .from_orm() to work

class UserProfileWithPosts(BaseModel):
    id: int
    username: str
    followers_count: int
    following_count: int
    is_following: bool
    posts: List[Post]  # assuming your Post schema exists

    class Config:
        orm_mode = True

class MyPost(BaseModel):
    id: int
    title: str
    content: str
    timestamp: datetime
    likes_count: int
    comments_count: int
    is_liked_by_current_user: bool

    class Config:
        from_attributes = True


class MyProfileWithPosts(BaseModel):
    id: int
    username: str
    followers_count: int
    following_count: int
    posts: List[MyPost]

    class Config:
        orm_mode = True
