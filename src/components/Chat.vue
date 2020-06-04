<template>
  <div class="wrapper">
    <!-- Sidebar  -->
    <nav id="sidebar">
      <div class="sidebar-header d-flex justify-content-around">
        <div class="pointer" v-on:click="onProfileClick">
          <h4>{{currentUserName}}</h4>
        </div>
        <button type="button" class="btn btn-primary" v-on:click="logout">Logout</button>
      </div>
      <ul class="list-unstyled components">
        <li
          class="active pl-3 mb-3"
          v-on:click="notificationErase(item)"
          v-for="item in searchUsers"
          :key="item.id"
          v-show="item.id != currentUserId"
        >
          <div class="d-flex" style="cursor: pointer">
            <img src="../assets/user.png" alt="user" height="40px" />
            <div>
              <h6>{{item.name}}</h6>
              <h6>New Messages</h6>
            </div>
          </div>
        </li>
      </ul>
    </nav>

    <!-- Page Content  -->
    <div id="content">
      <h2>Welcome {{currentUserName}},</h2>
      <h3>Let's connect the world</h3>
    </div>
  </div>
</template>

<script>
/* eslint-disable */
import firebase from "../services/firebase";
export default {
  app: "Chat",
  data() {
    return {
      currentUserName: localStorage.getItem("name"),
      currentPeerUser: null,
      displayNotification: [],
      currentUserId: localStorage.getItem("id"),
      currentUserPhoto: localStorage.getItem("photoURL"),
      currentUserDocumentId: localStorage.getItem("FirebaseDocumentId"),
      currentUserMessages: [],
      searchUsers: [],
      notificationMessagesErase: [],
      displayContacts: []
    };
  },
  methods: {
    logout() {
      firebase.auth().signOut();
      this.$router.push("/");
      localStorage.clear();
    },
    onProfileClick() {
      this.$router.push("/profile");
    },
    getClassNameForUserAndNotification(itemId) {
      let number = 0;
      let className = "";
      let check = false;
      if (this.currentPeerUser && this.currentPeerUser.id === itemId) {
        className = "viewFocused";
      } else {
        this.displayNotification.forEach(item => {
          if (itemId.notificationId.length > 0) {
            if (itemId.notificationId === itemId) {
              check = true;
              number = item.number;
            }
          }
        });
        if (check === true) {
          className = "viewWrapItemNotification";
        } else {
          className = "viewWrapItem";
        }
      }
      return className;
    },
    renderUsersList() {
      if (this.searchUsers.length > 0) {
        let viewListUser = [],
          className = "";
        this.searchUsers.map(item => {
          if (item.id != this.currentUserId) {
            className = this.getClassNameForUserAndNotification(item.id);
            viewListUser.push(
              <button id={item.key}>
                <img src={item.url} />
                <div>
                  <span>{item.name}</span>
                </div>
                <div>
                  <span>New Messages</span>
                </div>
              </button>
            );
          }
        });
      }
    },
    async getUsersList() {
      const result = await firebase
        .firestore()
        .collection("users")
        .get();
      if (result.docs.length > 0) {
        console.log("res...", result.docs);
        let listusers = [];
        listusers = [...result.docs];
        listusers.forEach((item, index) => {
          this.searchUsers.push({
            key: index,
            documentKey: item.id, //db doc id
            id: item.data().id, //uid
            name: item.data().name,
            messages: item.data().messages,
            URL: item.data().URL,
            description: item.data().description
          });
        });
      }
      this.renderUsersList();
    },
    notificationErase(item) {
      console.log(item);
      this.displayNotification.forEach(el => {
        if (el.notificationId.length > 0) {
          if (el.notificationId != item.id) {
            this.notificationMessagesErase.push({
              notificationId: el.notificationId,
              number: el.number
            });
          }
        }
      });
      this.currentPeerUser = item;
      this.updateRenderList();
    },
    updateRenderList() {
      firebase
        .firestore()
        .collection("users")
        .doc(this.currentUserDocumentId)
        .update({
          messages: this.notificationMessagesErase
        });
      this.displayNotification = this.notificationMessagesErase;
    }
  },
  created() {
    if (!localStorage.hasOwnProperty("id")) {
      this.$router.push("/");
    } else {
      firebase
        .firestore()
        .collection("users")
        .doc(this.currentUserDocumentId)
        .get()
        .then(doc => {
          doc.data().messages.map(el => {
            this.currentUserMessages.push({
              notificationId: el.notificationId,
              number: el.number
            });
          });
          this.displayNotification = this.currentUserMessages;
        });
      this.getUsersList();
    }
  }
};
</script>

<style scoped>
.pointer {
  cursor: pointer;
}
</style>