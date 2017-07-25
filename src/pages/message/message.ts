import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, Content, AlertController, ModalController, ActionSheetController } from 'ionic-angular';
import { DataProvider } from '../../providers/data';
import { LoadingProvider } from '../../providers/loading';
import { ImageProvider } from '../../providers/image';
import { AngularFireDatabase } from 'angularfire2/database';
import * as firebase from 'firebase';
import { UserInfoPage } from '../user-info/user-info';
import { ImageModalPage } from '../image-modal/image-modal';

import { Camera } from '@ionic-native/camera';
import { Contacts } from '@ionic-native/contacts';
import { Keyboard } from '@ionic-native/keyboard';
import { Geolocation } from '@ionic-native/geolocation';

@Component({
  selector: 'page-message',
  templateUrl: 'message.html'
})
export class MessagePage {
  @ViewChild(Content) content: Content;
  private userId: any;
  private title: any;
  private message: any;
  private conversationId: any;
  private messages: any;
  private alert: any;
  private updateDateTime: any;
  private messagesToShow: any;
  private startIndex: any = -1;
  private scrollDirection: any = 'bottom';
  // Définir le nombre de messages à afficher.
  private numberOfMessages = 10;

  // MessagePage
 // C'est la page où l'utilisateur peut discuter avec un ami.
  constructor(public navCtrl: NavController, public navParams: NavParams, public dataProvider: DataProvider, public angularfire: AngularFireDatabase,
    public loadingProvider: LoadingProvider, public alertCtrl: AlertController, public imageProvider: ImageProvider, public modalCtrl: ModalController,
    public camera: Camera, public keyboard: Keyboard, public actionSheet: ActionSheetController, public contacts: Contacts, public geolocation: Geolocation){ }

  ionViewDidLoad() {
    this.userId = this.navParams.get('userId');

    // Avoir les détails d'un ami.
    this.dataProvider.getUser(this.userId).subscribe((user) => {
      this.title = user.name;
    });

    // Avoir conversationInfo avec un ami.
    this.angularfire.object('/accounts/' + firebase.auth().currentUser.uid + '/conversations/' + this.userId).subscribe((conversation) => {
      if (conversation.$exists()) {
        // L'utilisateur a déjà une conversation avec cet ami, obtenez une conversation
        this.conversationId = conversation.conversationId;

        // Avoir la conversation
        this.dataProvider.getConversationMessages(this.conversationId).subscribe((messages) => {
          if (this.messages) {
            // Ajoutez simplement les nouveaux messages ajoutés au bas de la vue.
            if (messages.length > this.messages.length) {
              let message = messages[messages.length - 1];
              this.dataProvider.getUser(message.sender).subscribe((user) => {
                message.avatar = user.img;
              });
              this.messages.push(message);
              // Ajouter aussi à messagesToShow.
              this.messagesToShow.push(message);
              // Réinitialiser scrollDirection en bas.
              this.scrollDirection = 'bottom';
            }
          } else {
            // Obtenez tous les messages, cela sera utilisé comme objet de référence pour messagesToShow.
            this.messages = [];
            messages.forEach((message) => {
              this.dataProvider.getUser(message.sender).subscribe((user) => {
                message.avatar = user.img;
              });
              this.messages.push(message);
            });
            // Charger des messages par rapport à numOfMessages.
            if (this.startIndex == -1) {
              // Obtenez l'index initial pour numberOfMessages à afficher.
              if ((this.messages.length - this.numberOfMessages) > 0) {
                this.startIndex = this.messages.length - this.numberOfMessages;
              } else {
                this.startIndex = 0;
              }
            }
            if (!this.messagesToShow) {
              this.messagesToShow = [];
            }
            // Modifier messagesToShow
            for (var i = this.startIndex; i < this.messages.length; i++) {
              this.messagesToShow.push(this.messages[i]);
            }
            this.loadingProvider.hide();
          }
        });
      }
    });

    //Date de mise à jour de la date écoulée chaque minute en fonction de Moment.js.
    var that = this;
    if (!that.updateDateTime) {
      that.updateDateTime = setInterval(function() {
        if (that.messages) {
          that.messages.forEach((message) => {
            let date = message.date;
            message.date = new Date(date);
          });
        }
      }, 60000);
    }
  }

// Charge les messages précédents en relation avec numberOfMessages.  
loadPreviousMessages() {
    var that = this;
    // Montrer le chargement.
    this.loadingProvider.show();
    setTimeout(function() {
      // Définir startIndex pour charger plus de messages.
      if ((that.startIndex - that.numberOfMessages) > -1) {
        that.startIndex -= that.numberOfMessages;
      } else {
        that.startIndex = 0;
      }
      // Rafraichir la liste de message
      that.messages = null;
      that.messagesToShow = null;
      // Réglez le sens de défilement vers le haut.
      that.scrollDirection = 'top';
      // Remplir la liste à nouveau.
      that.ionViewDidLoad();
    }, 1000);
  }

  // MAJ messagesRead Quand l'utilisateur quitte cette page.
  ionViewWillLeave() {
    if (this.messages)
      this.setMessagesRead(this.messages);
  }

  //Vérifiez si currentPage est actif, puis mettez à jour les messages de l'utilisateur messagesRead.
  setMessagesRead(messages) {
    if (this.navCtrl.getActive().instance instanceof MessagePage) {
      // MAJ les messagesRead de l'utilisateur dans la BD.
      var totalMessagesCount;
      this.dataProvider.getConversationMessages(this.conversationId).subscribe((messages) => {
        totalMessagesCount = messages.length;
      });
      this.angularfire.object('/accounts/' + firebase.auth().currentUser.uid + '/conversations/' + this.userId).update({
        messagesRead: totalMessagesCount
      });
    }
  }
// Vérifiez si le bouton 'retour' est pressé et envoyez le message.
  onType(keyCode) {
    if (keyCode == 13) {
      // this.keyboard.close();
      // this.send();
    }
  }
// Faites défiler jusqu'au bas de la page après un court délai.
  scrollBottom() {
    var that = this;
    setTimeout(function() {
      that.content.scrollToBottom();
    }, 300);
  }
// Faites défiler en haut de la page après un court délai.
  scrollTop() {
    var that = this;
    setTimeout(function() {
      that.content.scrollToTop();
    }, 300);
  }
// Défilement selon la direction.
  doScroll() {
    if (this.scrollDirection == 'bottom') {
      this.scrollBottom();
    } else if (this.scrollDirection == 'top') {
      this.scrollTop();
    }
  }// Vérifiez si l'utilisateur est l'expéditeur du message.
  isSender(message) {
    if (message.sender == firebase.auth().currentUser.uid) {
      return true;
    } else {
      return false;
    }
  }

  // Retour
  back() {
    this.navCtrl.pop();
  }

 //Envoyer un message, s'il n'y a pas encore de conversation, créez une nouvelle conversation.
  send() {
    if (this.message) {
      if (this.conversationId) {
        // Ajouter un message à la conversation existante
         // Clone une instance d'objet de messages afin qu'il ne soit pas directement mis à jour.
         // L'objet de message doit être mis à jour par notre observateur déclaré sur ionViewDidLoad.
        let messages = JSON.parse(JSON.stringify(this.messages));
        messages.push({
          date: new Date().toString(),
          sender: firebase.auth().currentUser.uid,
          type: 'text',
          message: this.message
        });
        // MAJ conversation dans la BD.
        this.dataProvider.getConversation(this.conversationId).update({
          messages: messages
        });
        // Nettoyer messagebox.
        this.message = '';
      } else {
        // Nouvelle Conversation avec un ami.
        var messages = [];
        messages.push({
          date: new Date().toString(),
          sender: firebase.auth().currentUser.uid,
          type: 'text',
          message: this.message
        });
        var users = [];
        users.push(firebase.auth().currentUser.uid);
        users.push(this.userId);
        // Add conversation.
        this.angularfire.list('conversations').push({
          dateCreated: new Date().toString(),
          messages: messages,
          users: users
        }).then((success) => {
          let conversationId = success.key;
          this.message = '';
          // Add conversation reference to the users.
          this.angularfire.object('/accounts/' + firebase.auth().currentUser.uid + '/conversations/' + this.userId).update({
            conversationId: conversationId,
            messagesRead: 1
          });
          this.angularfire.object('/accounts/' + this.userId + '/conversations/' + firebase.auth().currentUser.uid).update({
            conversationId: conversationId,
            messagesRead: 0
          });
        });
      }
    }
  }

  // Voir info de l'utilisateur
  viewUser(userId) {
    this.navCtrl.push(UserInfoPage, { userId: userId });
  }


  attach(){
    let action = this.actionSheet.create({
      title:'Choisissez les pièces à joindre',
      buttons:[{
        text: 'Camera',
        handler: () =>{
          console.log("Prendre une photo");
          this.imageProvider.uploadPhotoMessage(this.conversationId, this.camera.PictureSourceType.CAMERA).then((url) => {
            //Traiter le message image
            this.sendPhotoMessage(url);
          });
        }
      },{
        text: 'Galerie de photo',
        handler: ()=>{
          console.log("Accéder à la galerie");
          this.imageProvider.uploadPhotoMessage(this.conversationId, this.camera.PictureSourceType.PHOTOLIBRARY).then((url) => {
              // Traiter le message image
              this.sendPhotoMessage(url);
          });
        }
      },{
        text: 'Vidéo',
        handler: () =>{
          console.log("Vidéo");
          this.imageProvider.uploadVideoMessage(this.conversationId).then(url=>{
            this.sendVideoMessage(url);
          });
        }
      },{
        text: 'Localisation',
        handler:()=>{
          console.log("Localisation");
          this.geolocation.getCurrentPosition({
            timeout: 2000
          }).then(res => {
            let locationMessage = "Position actuelle: lat:"+res.coords.latitude+" lng:"+res.coords.longitude;
            let confirm = this.alertCtrl.create({
              title: 'Votre localisation',
              message: locationMessage,
              buttons:[{
                text:'Annuler',
                handler: () =>{
                  console.log("canceled");
                }
              },{
                text: 'Partager',
                handler: () =>{
                  console.log("share");
                  this.message = locationMessage;
                  this.send();
                }
              }]
            });
            confirm.present();
          }, locationErr => {
            console.log("Erreur de localisation"+ JSON.stringify(locationErr));
          });
        }
      },{
        text: 'Contact',
        handler: () =>{
          console.log("Partager le contact");
          this.contacts.pickContact().then( data =>{
            console.log(data.displayName);
            console.log(data.phoneNumbers[0].value);
            this.message = data.displayName+" ph: "+data.phoneNumbers[0].value;
            this.send();
          }, err=>{
            console.log(err);
          })
        }
      },{
        text: 'Annuler',
        role: 'Annuler',
        handler: ()=>{
          console.log("Annulé");
        }
      }]
    });
    action.present();
  }
  takePhoto(){
    this.imageProvider.uploadPhotoMessage(this.conversationId, this.camera.PictureSourceType.CAMERA).then((url) => {
      // Traitement du message image
      this.sendPhotoMessage(url);
    });
  }

  // Traitement photoMessage dans la BD.
  sendPhotoMessage(url) {
    if (this.conversationId) {
      // Ajouter un message d'image à une conversation existante.
      let messages = JSON.parse(JSON.stringify(this.messages));
      messages.push({
        date: new Date().toString(),
        sender: firebase.auth().currentUser.uid,
        type: 'image',
        url: url
      });
      // Mettre à jour la conversation sur la base de données.
      this.dataProvider.getConversation(this.conversationId).update({
        messages: messages
      });
    } else {
      //  Créer une nouvelle conversation.
	  var messages = [];
      messages.push({
        date: new Date().toString(),
        sender: firebase.auth().currentUser.uid,
        type: 'image',
        url: url
      });
      var users = [];
      users.push(firebase.auth().currentUser.uid);
      users.push(this.userId);
      // Ajouter une conversation.
      this.angularfire.list('conversations').push({
        dateCreated: new Date().toString(),
        messages: messages,
        users: users
      }).then((success) => {
        let conversationId = success.key;
        // Ajouter une conversation referencé à un utilisateur.
        this.angularfire.object('/accounts/' + firebase.auth().currentUser.uid + '/conversations/' + this.userId).update({
          conversationId: conversationId,
          messagesRead: 1
        });
        this.angularfire.object('/accounts/' + this.userId + '/conversations/' + firebase.auth().currentUser.uid).update({
          conversationId: conversationId,
          messagesRead: 0
        });
      });
    }
  }
    // Traitement de la Video sur la base de données.
  sendVideoMessage(url) {
    if (this.conversationId) {
      // Add image message to existing conversation.
      let messages = JSON.parse(JSON.stringify(this.messages));
      messages.push({
        date: new Date().toString(),
        sender: firebase.auth().currentUser.uid,
        type: 'video',
        url: url
      });
      // MAJ conversation dans la database.
      this.dataProvider.getConversation(this.conversationId).update({
        messages: messages
      });
    } else {
      // Création d'une nouvelle conversation.
      var messages = [];
      messages.push({
        date: new Date().toString(),
        sender: firebase.auth().currentUser.uid,
        type: 'video',
        url: url
      });
      var users = [];
      users.push(firebase.auth().currentUser.uid);
      users.push(this.userId);
      // Ajout de conversation.
      this.angularfire.list('conversations').push({
        dateCreated: new Date().toString(),
        messages: messages,
        users: users
      }).then((success) => {
        let conversationId = success.key;
        // Ajout de conversation avec une référence d'utilisateur
        this.angularfire.object('/accounts/' + firebase.auth().currentUser.uid + '/conversations/' + this.userId).update({
          conversationId: conversationId,
          messagesRead: 1
        });
        this.angularfire.object('/accounts/' + this.userId + '/conversations/' + firebase.auth().currentUser.uid).update({
          conversationId: conversationId,
          messagesRead: 0
        });
      });
    }
  }
// Agrandir les messages d'image.
  enlargeImage(img) {
    let imageModal = this.modalCtrl.create(ImageModalPage, { img: img });
    imageModal.present();
  }
}
