import { Component } from '@angular/core';
import { NavController, NavParams, AlertController } from 'ionic-angular';
import { DataProvider } from '../../providers/data';
import { FirebaseProvider } from '../../providers/firebase';
import { AngularFireDatabase } from 'angularfire2/database';
import { AlertProvider } from '../../providers/alert';
import { LoadingProvider } from '../../providers/loading';
import { UserInfoPage } from '../user-info/user-info';

@Component({
  selector: 'page-requests',
  templateUrl: 'requests.html'
})
export class RequestsPage {
  private friendRequests: any;
  private requestsSent: any;
  private alert: any;
  private account: any;
  // RequestsPage
  //C'est la page où l'utilisateur peut voir ses demandes d'amis envoyées et reçues.
  constructor(public navCtrl: NavController, public navParams: NavParams, public dataProvider: DataProvider, public alertCtrl: AlertController, public angularfire: AngularFireDatabase,
    public loadingProvider: LoadingProvider, public alertProvider: AlertProvider, public firebaseProvider: FirebaseProvider) { }

  ionViewDidLoad() {
    this.loadingProvider.show();
    // Avoir les info de l'utilisateur
    this.dataProvider.getCurrentUser().subscribe((account) => {
      this.account = account;
      //Recevez des demandes et des demandes d'amis de l'utilisateur.
      this.dataProvider.getRequests(this.account.userId).subscribe((requests) => {
        // friendRequests.
        if (requests.friendRequests) {
          this.friendRequests = [];
          requests.friendRequests.forEach((userId) => {
            this.dataProvider.getUser(userId).subscribe((sender) => {
              this.addOrUpdateFriendRequest(sender);
            });
          });
        } else {
          this.friendRequests = [];
        }
        // requestsSent.
        if (requests.requestsSent) {
          this.requestsSent = [];
          requests.requestsSent.forEach((userId) => {
            this.dataProvider.getUser(userId).subscribe((receiver) => {
              this.addOrUpdateRequestSent(receiver);
            });
          });
        } else {
          this.requestsSent = [];
        }
        this.loadingProvider.hide();
      });
    });
  }

  // Ajoutez ou mettez à jour une demande d'ami uniquement si vous n'êtes pas encore ami.
  addOrUpdateFriendRequest(sender) {
    if (!this.friendRequests) {
      this.friendRequests = [sender];
    } else {
      var index = -1;
      for (var i = 0; i < this.friendRequests.length; i++) {
        if (this.friendRequests[i].$key == sender.$key) {
          index = i;
        }
      }
      if (index > -1) {
        if (!this.isFriends(sender.$key))
          this.friendRequests[index] = sender;
      } else {
        if (!this.isFriends(sender.$key))
          this.friendRequests.push(sender);
      }
    }
  }

  // Ajoutez ou mettez à jour les requêtes envoyées uniquement si l'utilisateur n'est pas encore un ami.
  addOrUpdateRequestSent(receiver) {
    if (!this.requestsSent) {
      this.requestsSent = [receiver];
    } else {
      var index = -1;
      for (var i = 0; i < this.requestsSent.length; i++) {
        if (this.requestsSent[i].$key == receiver.$key) {
          index = i;
        }
      }
      if (index > -1) {
        if (!this.isFriends(receiver.$key))
          this.requestsSent[index] = receiver;
      } else {
        if (!this.isFriends(receiver.$key))
          this.requestsSent.push(receiver);
      }
    }
  }

  // Retour
  back() {
    this.navCtrl.pop();
  }



  // Accepter la demande d'ami.
  acceptFriendRequest(user) {
    this.alert = this.alertCtrl.create({
      title: 'Confirmer la demande d\'ami',
      message: 'Voulez-vous accepter la demande d\'ami de <b>' + user.name + '</b>',
      buttons: [


        {
          text: 'Accepter la demande',
          handler: () => {
            this.firebaseProvider.acceptFriendRequest(user.$key);
          }
        },
        
        {
          text: 'Rejeter',
          handler: () => {
            this.firebaseProvider.deleteFriendRequest(user.$key);
          }
        },
        {
          text: 'Annuler',
          handler: data => { }
        }
      ]
    }).present();
  }
    // Annuler la demande d'ami envoyée.
  cancelFriendRequest(user) {
    this.alert = this.alertCtrl.create({
      title: 'Demande d\'ami en attente',
      message: 'Voulez-vous supprimer la demande d\'ami à <b>' + user.name + '</b>?',
      buttons: [
      {
          text: 'Supprimer',
          handler: () => {
            this.firebaseProvider.cancelFriendRequest(user.$key);
          }
        },
        {
          text: 'Annuler',
          handler: data => { }
        }
      ]
    }).present();
  }

// Vérifie si l'utilisateur est déjà ami avec cet utilisateur.
  isFriends(userId) {
    if (this.account.friends) {
      if (this.account.friends.indexOf(userId) == -1) {
        return false;
      } else {
        return true;
      }
    } else {
      return false;
    }
  }

  // Voir l'utilisateur
  viewUser(userId) {
    this.navCtrl.push(UserInfoPage, { userId: userId });
  }

}
