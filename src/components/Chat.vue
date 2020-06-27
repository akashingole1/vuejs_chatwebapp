<template>
  <div class="wrapper">
    <!-- Sidebar  -->
    <nav style="color: white" id="sidebar">
      <div class="sidebar-header d-flex justify-content-around">
        <div class="pointer" v-on:click="onProfileClick">
          <h4>{{currentUserName}}</h4>
        </div>
        <button type="button" class="btn btn-primary" v-on:click="logout">Logout</button>
      </div>
      <div style="height: 1px; border-bottom: 1px solid #00388b"></div>
      <ul class="list-unstyled components">
        <li
          class="active mb-3"
          v-on:click="notificationErase(item)"
          v-for="item in searchUsers"
          :key="item.id"
          v-show="item.id != currentUserId"
        >
          <div class="d-flex" style="cursor: pointer; padding-bottom: 15px; width: 100%">
            <div style="width: 30%">
              <img
                :src="item.URL"
                alt="user"
                width="50px"
                height="50px"
                style="border-radius: 50%; background: white;"
              />
            </div>
            <div
              style="padding: 10px 0px 0px; width: 50%; display: flex; justify-content: space-between"
            >
              <h6>{{item.name}}</h6>
              <h6>9:00</h6>
            </div>
          </div>
          <div style="height: 1px; border-bottom: 1px solid #00388b"></div>
        </li>
      </ul>
    </nav>

    <!-- Page Content  -->
    <div id="content" v-if="currentPeerUser===null">
      <div class="my-4">
        <img :src="photoURL" width="200px" class="br-50" />
      </div>
      <div>
        <h2>Welcome {{currentUserName}},</h2>
        <h3>Let's spread love</h3>
      </div>
    </div>
    <div v-else class="header-width">
      <ChatBox v-bind:currentPeerUser="currentPeerUser" />
    </div>
  </div>
</template>

<script>
/* eslint-disable */
import firebase from "../services/firebase";
import ChatBox from "./ChatBox";

export default {
  components: {
    ChatBox
  },
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
      displayContacts: [],
      photoURL: localStorage.getItem("photoURL")
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
          console.log("doc data", doc.data());
          console.log("messages", doc.data().messages);
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
.br-50 {
  border-radius: 50%;
}
.header-width {
  width: calc(100% - 350px);
  min-height: 100vh;
  transition: all 0.3s;
  position: absolute;
  top: 0;
  right: 0;
}
</style>