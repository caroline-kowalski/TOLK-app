import { Component } from '@angular/core';
import { NavController, NavParams, App } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';
import { LoadingProvider } from '../../providers/loading';
import { DataProvider } from '../../providers/data';
import { NewMessagePage } from '../new-message/new-message';
import { MessagePage } from '../message/message';
import * as firebase from 'firebase';

@Component({
  selector: 'page-messages',
  templateUrl: 'messages.html'
})
export class MessagesPage {
  private conversations: any;
  private updateDateTime: any;
  private searchFriend: any;
  // MessagesPage
 // C'est la page où l'utilisateur peut voir ses conversations actuelles avec ses amis.
   // L'utilisateur peut également démarrer une nouvelle conversation.
  constructor(public navCtrl: NavController, public navParams: NavParams, public angularfire: AngularFireDatabase, public loadingProvider: LoadingProvider, public app: App, public dataProvider: DataProvider) { }

  ionViewDidLoad() {
   // Créez userData sur la base de données si elle n'existe pas encore.
    this.createUserData();
    this.searchFriend = '';
    this.loadingProvider.show();
    if(firebase.auth().currentUser!=null || firebase.auth().currentUser!=undefined ){
      // update token
      this.angularfire.object('/accounts/' + firebase.auth().currentUser.uid).update({
        pushToken: localStorage.getItem('pushToken')
      });
    }
    //Obtenir des informations sur les conversations de l'utilisateur connecté en cours.
    this.dataProvider.getConversations().subscribe((conversations) => {
      if (conversations.length > 0) {
        conversations.forEach((conversation) => {
          if (conversation.$exists()) {
            // Avoir les info du partenaire de la conversation
            this.dataProvider.getUser(conversation.$key).subscribe((user) => {
              conversation.friend = user;
              // Avoir info de la conversation .
              this.dataProvider.getConversation(conversation.conversationId).subscribe((obj) => {
                // Obtenez le dernier message de conversation.
                let lastMessage = obj.messages[obj.messages.length - 1];
                conversation.date = lastMessage.date;
                conversation.sender = lastMessage.sender;
                // Modifier unreadMessagesCount
                conversation.unreadMessagesCount = obj.messages.length - conversation.messagesRead;
                // Procédez au dernier message selon le type de message.
                if (lastMessage.type == 'text') {
                  if (lastMessage.sender == firebase.auth().currentUser.uid) {
                    conversation.message = 'You: ' + lastMessage.message;
                  } else {
                    conversation.message = lastMessage.message;
                  }
                } else {
                  if (lastMessage.sender == firebase.auth().currentUser.uid) {
                    conversation.message = 'You sent a photo message.';
                  } else {
                    conversation.message = 'has sent you a photo message.';
                  }
                }
                // Ajouter ou maj une conversation.
                this.addOrUpdateConversation(conversation);
              });
            });
          }
        });
        this.loadingProvider.hide();
      } else {
        this.conversations = [];
        this.loadingProvider.hide();
      }
    });

    // Mettre à jour la dernière date de validation des conversations écoulées à chaque minute en fonction de Moment.js.
    var that = this;
    if (!that.updateDateTime) {
      that.updateDateTime = setInterval(function() {
        if (that.conversations) {
          that.conversations.forEach((conversation) => {
            let date = conversation.date;
            conversation.date = new Date(date);
          });
        }
      }, 60000);
    }
  }

 // Ajouter ou mettre à jour une conversation pour la synchronisation en temps réel en fonction de notre observateur, trier par date active.
  addOrUpdateConversation(conversation) {
    if (!this.conversations) {
      this.conversations = [conversation];
    } else {
      var index = -1;
      for (var i = 0; i < this.conversations.length; i++) {
        if (this.conversations[i].$key == conversation.$key) {
          index = i;
        }
      }
      if (index > -1) {
        this.conversations[index] = conversation;
      } else {
        this.conversations.push(conversation);
      }
      // Trier par dernière date active.
      this.conversations.sort((a: any, b: any) => {
        let date1 = new Date(a.date);
        let date2 = new Date(b.date);
        if (date1 > date2) {
          return -1;
        } else if (date1 < date2) {
          return 1;
        } else {
          return 0;
        }
      });
    }
  }

  // Créez userData sur la base de données si elle n'existe pas encore.
  createUserData() {
    firebase.database().ref('accounts/' + firebase.auth().currentUser.uid).once('value')
      .then((account) => {
        
        if (!account.val()) {
          this.loadingProvider.show();
          let user = firebase.auth().currentUser;
          var userId, name, provider, img, email;
          let providerData = user.providerData[0];
// Pas encore de données de base de données, créez des données utilisateur sur la base de données
          userId = user.uid;

          // Obtenez le nom de l'utilisateur Firebase.
          if (user.displayName || providerData.displayName) {
            name = user.displayName;
            name = providerData.displayName;
          } else {
            name = "Tolk utilisateur";
          }

          // Définissez le nom d'utilisateur par défaut en fonction du nom et de l'utilisateur.
          let username = name.replace(/ /g, '') + userId.substring(0, 8);

          //Obtenez un fournisseur de l'utilisateur Firebase.
          if (providerData.providerId == 'password') {
            provider = "Firebase";
          } else if (providerData.providerId == 'facebook.com') {
            provider = "Facebook";
          } else if (providerData.providerId == 'google.com') {
            provider = "Google";
          }

          // Obtenez photoURL depuis l'utilisateur de Firebase.
          if (user.photoURL || providerData.photoURL) {
            img = user.photoURL;
            img = providerData.photoURL;
          } else {
            img = "assets/images/profile.png";
          }
// Obtenez un email partir de l'utilisateur de Firebase.
          email = user.email;

          // Modifier la description par défaut.
          let description = "Je suis disponible pour discuter";

          let profession = "Modifier ma profession";

          // Insérez des données sur notre base de données en utilisant AngularFire.
          this.angularfire.object('/accounts/' + userId).set({
            userId: userId,
            name: name,
            username: username,
            provider: provider,
            img: img,
            email: email,
            description: description,
            profession: profession,
            dateCreated: new Date().toString()
          }).then(() => {
            this.loadingProvider.hide();
          });
        }
      });
  }

  // Nouvelle conversation.
  newMessage() {
    this.app.getRootNav().push(NewMessagePage);
  }

  // Ouvrir un chat avec un ami.
  message(userId) {
    this.app.getRootNav().push(MessagePage, { userId: userId });
  }

  //Classe de retour si la conversation a été non lue "unreadMessages" ou non.
  hasUnreadMessages(conversation) {
    if (conversation.unreadMessagesCount > 0) {
      return 'bold';
    } else
      return '';
  }
}
