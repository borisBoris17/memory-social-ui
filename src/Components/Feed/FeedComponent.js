import { React, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import config from '../../config';
import { Card } from '@mui/material';
import AddCommentComponent from '../Shared/AddCommentComponent';
import PostListComponent from '../Shared/PostListComponent';
import { ProfileContext } from '../../App';

function FeedComponent({ profileId, isLoggedIn }) {
  const [posts, setPosts] = useState([]);
  const { profile } = useContext(ProfileContext);

  useEffect(() => {
    if (profileId && profileId !== '') {
      axios.get(`${config.api.protocol}://${config.api.host}/memory-social-api/node/feed/${profileId}`).then(resp => {
        setPosts(resp.data)
      });
    }
  }, [profileId]);

  const handleCreateNewPost = async (postText, files) => {
    const post = createPostObject(postText);
    const savedPost = await axios.post(`${config.api.protocol}://${config.api.host}/memory-social-api/node/`, post);
    const authoredRelation = createRelationObject(profile.node_id, savedPost.data.node_id, 'Authored');
    const authoredByRelation = createRelationObject(savedPost.data.node_id, profile.node_id, 'Authored_by');
    await axios.post(`${config.api.protocol}://${config.api.host}/memory-social-api/relation/`, authoredRelation);
    await axios.post(`${config.api.protocol}://${config.api.host}/memory-social-api/relation/`, authoredByRelation);
    var formData = new FormData();
    formData.append("postId", savedPost.data.node_id);
    formData.append("profileId", profile.node_id);
    files.forEach(file => {
      formData.append("images", file);
    })
    axios.post(`${config.api.protocol}://${config.api.host}/memory-social-api/node/uploadImage`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }).then(resp => {
      axios.get(`${config.api.protocol}://${config.api.host}/memory-social-api/node/feed/${profileId}`).then(resp => {
        setPosts(resp.data)
      });
    })
  }

  const createPostObject = (postText) => {
    return {
      node_type: "Post",
      content: {
        text: postText,
        images: []
      }
    }
  }

  const createRelationObject = (sourceId, destId, type) => {
    return {
      source_id: sourceId,
      dest_id: destId,
      relation_type: type,
      content: null
    }
  }

  return (
    <div className="feedComponent">
      {isLoggedIn && profile.content !== undefined ? <>
        <div className="feed">
          <div>
            <Card className="postsCard">
                {profile.content !== undefined ? <AddCommentComponent placeholder={`What is on your mind, ${profile.content.name}?`} buttonLabel="Post" handlePostComment={handleCreateNewPost} /> : ''}
            </Card>
            {posts !== undefined && posts.length > 1 ? <PostListComponent posts={posts} /> : ""}
          </div>
        </div>
        <div className="FeedSideComponent">
        <Card>
        a
        </Card>
      </div> </> : <>
        <div className="feed">
            <Card className="postsCard">
              <div className="missingProfileMessageDiv">No profile loaded, make sure you are logged in...</div>
            </Card>
        </div>
        
        <div className="FeedSideComponent">
        <Card>
          asdfe
        </Card>
      </div> </>}
    </div>
  );
}

export default FeedComponent;