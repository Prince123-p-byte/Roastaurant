// Firebase Database Operations
const postsCollection = db.collection("posts");

// Save post to Firestore
async function savePost(post) {
  try {
    await postsCollection.doc(post.id).set(post);
    console.log("Post saved to Firestore");
  } catch (error) {
    console.error("Error saving post:", error);
  }
}

// Get all posts for a user
async function getPosts(userId) {
  const snapshot = await postsCollection.where("userId", "==", userId).get();
  return snapshot.docs.map(doc => doc.data());
}

// Get single post by ID
async function getPostById(postId) {
  const doc = await postsCollection.doc(postId).get();
  return doc.exists ? doc.data() : null;
}

// Add response (roast/compliment)
async function addResponse(postId, type, content) {
  const response = {
    id: Date.now().toString(),
    content,
    timestamp: new Date().toISOString()
  };

  await postsCollection.doc(postId).update({
    [type]: firebase.firestore.FieldValue.arrayUnion(response)
  });
}

// Real-time updates listener
function setupRealtimeListener(userId, callback) {
  return postsCollection
    .where("userId", "==", userId)
    .onSnapshot(snapshot => {
      snapshot.docChanges().forEach(change => {
        if (change.type === "modified") {
          callback(change.doc.data());
        }
      });
    });
}