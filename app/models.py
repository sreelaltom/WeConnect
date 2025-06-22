from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    ForeignKey,
    Table,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base

# Association table for follower-followee relationships
Follow = Table(
    "follows",
    Base.metadata,
    Column("follower_id", Integer, ForeignKey("users.id"), primary_key=True, index=True),
    Column("followee_id", Integer, ForeignKey("users.id"), primary_key=True, index=True),
)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    posts = relationship(
        "Post",
        back_populates="owner",
        cascade="all, delete-orphan"
    )
    comments = relationship(   # ✅ Added for reverse access in Comment
        "Comment",
        back_populates="owner",
        cascade="all, delete-orphan"
    )

    followers = relationship(
        "User",
        secondary=Follow,
        primaryjoin=id == Follow.c.followee_id,
        secondaryjoin=id == Follow.c.follower_id,
        back_populates="following",
    )

    following = relationship(
        "User",
        secondary=Follow,
        primaryjoin=id == Follow.c.follower_id,
        secondaryjoin=id == Follow.c.followee_id,
        back_populates="followers",
    )

    def __repr__(self):
        return f"<User(id={self.id}, username={self.username})>"


class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    content = Column(String(280), nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    owner = relationship("User", back_populates="posts")
    likes = relationship(
        "Like",
        back_populates="post",
        cascade="all, delete-orphan"
    )
    retweets = relationship(
        "Retweet",
        back_populates="post",
        cascade="all, delete-orphan"
    )
    comments = relationship(
        "Comment",
        back_populates="post",
        cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<Post(id={self.id}, title={self.title}, owner_id={self.owner_id})>"


class Like(Base):
    __tablename__ = "likes"

    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True, nullable=False, index=True)
    post_id = Column(Integer, ForeignKey("posts.id"), primary_key=True, nullable=False, index=True)

    user = relationship("User")
    post = relationship("Post", back_populates="likes")

    def __repr__(self):
        return f"<Like(user_id={self.user_id}, post_id={self.post_id})>"


class Retweet(Base):
    __tablename__ = "retweets"

    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True, nullable=False, index=True)
    post_id = Column(Integer, ForeignKey("posts.id"), primary_key=True, nullable=False, index=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")
    post = relationship("Post", back_populates="retweets")

    def __repr__(self):
        return f"<Retweet(user_id={self.user_id}, post_id={self.post_id})>"


class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(String(500), nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    post_id = Column(Integer, ForeignKey("posts.id"), nullable=False, index=True)

    owner = relationship("User", back_populates="comments")  # ✅ Important: Allows access to comment.owner.username
    post = relationship("Post", back_populates="comments")

    def __repr__(self):
        return f"<Comment(id={self.id}, owner_id={self.owner_id}, post_id={self.post_id})>"
