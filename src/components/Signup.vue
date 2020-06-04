<template>
  <div>
    <h2>Welcome to Vue.js Chat App</h2>
    <form class="detail-box my-5">
      <div class="form-group my-3">
        <h4>Signup to Chat</h4>
        <input
          type="text"
          v-model="name"
          class="form-control mb-4 mt-4"
          placeholder="Enter your name..."
        />
        <input
          type="text"
          v-model="email"
          class="form-control mb-4"
          placeholder="Enter your email..."
        />
        <input
          type="password"
          v-model="password"
          class="form-control mb-4"
          placeholder="Enter your password..."
        />
        <a href="/">
          <h6 class="mb-3">Back to login</h6>
        </a>
        <button type="button" v-on:click="signup" class="btn btn-primary">Signup</button>
      </div>
    </form>
  </div>
</template>

<script>
/* eslint-disable */
import firebase from "../services/firebase";

export default {
  app: "Signup",
  data() {
    return {
      name: "",
      email: "",
      password: ""
    };
  },
  methods: {
    signup() {
      const auth = firebase.auth();
      const name = this.name;
      const email = this.email;
      const password = this.password;
      auth
        .createUserWithEmailAndPassword(this.email, this.password)
        .then(async res => {
          console.log("res", res);
          await firebase
            .firestore()
            .collection("users")
            .add({
              name,
              id: res.user.uid,
              email,
              password,
              URL: "",
              messages: [{ notificationId: "", number: 0 }],
              description: ""
            })
            .then(ref => {
              console.log("ref", ref);
              localStorage.setItem("id", res.user.uid);
              localStorage.setItem("name", name);
              localStorage.setItem("email", email);
              localStorage.setItem("password", password);
              localStorage.setItem("photoURL", "");
              localStorage.setItem("uploadChanged", "state_changed");
              localStorage.setItem("desc", "");
              localStorage.setItem("FirebaseDocumentId", ref.id);
              this.name = "";
              this.email = "";
              this.password = "";
              this.$router.push("/chat");
            })
            .catch(err => console.log(err));
        })
        .catch(function(error) {
          // Handle Errors here.
          var errorCode = error.code;
          var errorMessage = error.message;
          if (errorCode == "auth/weak-password") {
            alert("The password is too weak.");
          } else {
            alert(errorMessage);
          }
          console.log(error);
        });
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