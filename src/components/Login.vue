<template>
  <div>
    <h2>Welcome to Vue.js Chat App</h2>
    <form class="detail-box my-5">
      <div class="form-group my-3">
        <h4>Login to Chat</h4>
        <input
          type="text"
          v-model="email"
          class="form-control mb-4 mt-4"
          placeholder="Enter your email..."
        />
        <input
          type="password"
          v-model="password"
          class="form-control mb-4"
          placeholder="Enter your password..."
        />
        <a href="/signup">
          <h6 class="mb-3">Create an account</h6>
        </a>

        <button type="button" v-on:click="login" class="btn btn-primary">Login</button>
      </div>
    </form>
  </div>
</template>

<script>
/* eslint-disable */
import firebase from "../services/firebase";

export default {
  app: "Login",
  data() {
    return {
      email: "",
      password: ""
    };
  },
  methods: {
    login() {
      const auth = firebase.auth();
      auth
        .signInWithEmailAndPassword(this.email, this.password)
        .then(async res => {
          console.log("res", res);
          let user = res.user;
          if (user) {
            //here we are looking if the user that logs in, if his uid matches
            // with any id in the database
            // As while signing up we have stored user's uid as id in database
            await firebase
              .firestore()
              .collection("users")
              .where("id", "==", user.uid)
              .get()
              .then(function(querySnapshot) {
                querySnapshot.forEach(doc => {
                  // doc refers to database document id
                  let userData = doc.data();
                  localStorage.setItem("id", userData.id);
                  localStorage.setItem("name", userData.name);
                  localStorage.setItem("email", userData.email);
                  localStorage.setItem("password", userData.password);
                  localStorage.setItem("photoURL", userData.URL);
                  localStorage.setItem("desc", userData.description);
                  localStorage.setItem("FirebaseDocumentId", doc.id);
                });
              });
            this.$router.push("/chat");
          }
        })
        .catch(function(error) {
          // Handle Errors here.
          var errorCode = error.code;
          var errorMessage = error.message;
          alert(errorCode);
          alert(errorMessage);
          console.log(error);
        });
    }
  },
  created() {
    if (localStorage.getItem("id")) {
      this.$router.push("/chat");
    }
  }
};
</script>


<style scoped>
input[type="text"],
input[type="password"] {
  margin: 0 auto;
  width: 80%;
}
.detail-box {
  padding: 5px;
  border: 1px solid lightgrey;
  width: 400px;
  min-height: 250px;
  margin: 0 auto;
}
</style>