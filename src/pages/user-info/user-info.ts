import { Component } from '@angular/core';
import { NavController, NavParams, ModalController, AlertController } from 'ionic-angular';
import { DataProvider } from '../../providers/data';
import { LoadingProvider } from '../../providers/loading';
import { FirebaseProvider } from '../../providers/firebase';
import { MessagePage } from '../message/message';
import { ImageModalPage } from '../image-modal/image-modal';
import * as firebase from 'firebase';

@Component({
  selector: 'page-user-info',
  templateUrl: 'user-info.html'
})
export class UserInfoPage {
  private user: any;
  private userId: any;
  private friendRequests: any;
  private requestsSent: any;
  private friends: any;
  private alert: any;
  // UserInfoPage
 // Il s'agit de la page où l'utilisateur peut afficher les informations de l'utilisateur et effectuer les actions appropriées en fonction de leur relation avec l'utilisateur connecté en cours.
  constructor(public navCtrl: NavController, public navParams: NavParams, public modalCtrl: ModalController, public dataProvider: DataProvider,
    public loadingProvider: LoadingProvider, public alertCtrl: AlertController, public firebaseProvider: FirebaseProvider) { }

  ionViewDidLoad() {
    this.userId = this.navParams.get('userId');
    this.loadingProvider.show();
    // Avoir les infos de l'utilisateur.
    this.dataProvider.getUser(this.userId).subscribe((user) => {
      this.user = user;
      this.loadingProvider.hide();
    });
    // Recevez des amis de l'utilisateur connecté en cours.
    this.dataProvider.getUser(firebase.auth().currentUser.uid).subscribe((user) => {
      this.friends = user.friends;
    });
    //Obtenir des demandes d'utilisateur connecté en cours.
    this.dataProvider.getRequests(firebase.auth().currentUser.uid).subscribe((requests) => {
      this.friendRequests = requests.friendRequests;
      this.requestsSent = requests.requestsSent;
    });
  }

  // Retour
  back() {
    this.navCtrl.pop();
  }

  // Agrandir l'image du profil de l'utilisateur.
  enlargeImage(img) {
    let imageModal = this.modalCtrl.create(ImageModalPage, { img: img });
    imageModal.present();
  }

  // Accepter la demande d'ami.
  acceptFriendRequest() {
    this.alert = this.alertCtrl.create({
      title: 'Demande en ami',
      message: 'Voulez-vous accepter <b>' + this.user.name + '</b> en tant qu\'ami?',
      buttons: [
        {
          text: 'Annuler',
          handler: data => { }
        },
        {
          text: 'Accepter',
          handler: () => {
            this.firebaseProvider.acceptFriendRequest(this.userId);
          }
        }
      ]
    }).present();
  }

  // Dénier la demande d'ami.
  rejectFriendRequest() {
    this.alert = this.alertCtrl.create({
      title: 'Rejeter une demande d\'ami',
      message: 'Vous voulez rejeter <b>' + this.user.name + '</b> en tant qu\'ami?',
      buttons: [
        {
          text: 'Annuler',
          handler: data => { }
        },
        {
          text: 'Rejeter',
          handler: () => {
            this.firebaseProvider.deleteFriendRequest(this.userId);
          }
        }
      ]
    }).present();
  }

  // Annuler la demande d'ami envoyée.
  cancelFriendRequest() {
    this.alert = this.alertCtrl.create({
      title: 'Demande d\'ami en attente',
      message: 'Vous voulez supprimer votre demande d\'ami pour <b>' + this.user.name + '</b>?',
      buttons: [
        {
          text: 'Annuler',
          handler: data => { }
        },
        {
          text: 'Supprimer',
          handler: () => {
            this.firebaseProvider.cancelFriendRequest(this.userId);
          }
        }
      ]
    }).present();
  }

  // Envoyer la demande d'ami.
  sendFriendRequest() {
    this.alert = this.alertCtrl.create({
      title: 'Envoyer une demande d\'ami',
      message: 'Vous voulez envoyer une demande d\'ami à <b>' + this.user.name + '</b>?',
      buttons: [
        {
          text: 'Annuler',
          handler: data => { }
        },
        {
          text: 'Envoyer',
          handler: () => {
            this.firebaseProvider.sendFriendRequest(this.userId);
          }
        }
      ]
    }).present();
  }

  // Ouvrez le chat avec cet utilisateur.
  sendMessage() {
    this.navCtrl.push(MessagePage, { userId: this.userId });
  }

  // Vérifiez si l'utilisateur peut être ajouté, ce qui signifie que l'utilisateur n'est pas encore ami ni envoyé / reçu des demandes d'amis.
  canAdd() {
    if (this.friendRequests) {
      if (this.friendRequests.indexOf(this.userId) > -1) {
        return false;
      }
    }
    if (this.requestsSent) {
      if (this.requestsSent.indexOf(this.userId) > -1) {
        return false;
      }
    }
    if (this.friends) {
      if (this.friends.indexOf(this.userId) > -1) {
        return false;
      }
    }
    return true;
  }
}
