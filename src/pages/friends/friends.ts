import { Component } from '@angular/core';
import { NavController, NavParams, App } from 'ionic-angular';
import { SearchPeoplePage } from '../search-people/search-people';
import { UserInfoPage } from '../user-info/user-info';
import { MessagePage } from '../message/message';
import { RequestsPage } from '../requests/requests';
import { DataProvider } from '../../providers/data';
import { LoadingProvider } from '../../providers/loading';
import * as firebase from 'firebase';

@Component({
  selector: 'page-friends',
  templateUrl: 'friends.html'
})
export class FriendsPage {
  private friends: any;
  private friendRequests: any;
  private searchFriend: any;
  // FriendsPage
    // C'est la page où l'utilisateur peut rechercher, afficher et lancer un chat avec ses amis.
  constructor(public navCtrl: NavController, public navParams: NavParams, public app: App, public dataProvider: DataProvider,
    public loadingProvider: LoadingProvider) { }

  ionViewDidLoad() {
    // Initialiser
    this.searchFriend = '';
    this.loadingProvider.show();

   // Obtenir des demandes d'amis pour afficher le nombre de membres d'amis.
    this.dataProvider.getRequests(firebase.auth().currentUser.uid).subscribe((requests) => {
      this.friendRequests = requests.friendRequests;
    });

   // Obtenir des données utilisateur sur la base de données et obtenir une liste d'amis
    this.dataProvider.getCurrentUser().subscribe((account) => {
      if (account.friends) {
        for (var i = 0; i < account.friends.length; i++) {
          this.dataProvider.getUser(account.friends[i]).subscribe((friend) => {
            this.addOrUpdateFriend(friend);
          });
        }
      } else {
        this.friends = [];
      }
      this.loadingProvider.hide();
    });
  }

// Ajouter ou mettre à jour des données d'amis pour la synchronisation en temps réel.
  addOrUpdateFriend(friend) {
    if (!this.friends) {
      this.friends = [friend];
    } else {
      var index = -1;
      for (var i = 0; i < this.friends.length; i++) {
        if (this.friends[i].$key == friend.$key) {
          index = i;
        }
      }
      if (index > -1) {
        this.friends[index] = friend;
      } else {
        this.friends.push(friend);
      }
    }
  }

// Passez à la page searchPeople.
  searchPeople() {
    this.app.getRootNav().push(SearchPeoplePage);
  }

  // Passez à la page requests
  manageRequests() {
    this.app.getRootNav().push(RequestsPage);
  }

  // Passez à la page searchPeople userInfo
  viewUser(userId) {
    this.app.getRootNav().push(UserInfoPage, { userId: userId });
  }

// Passez à la page chat.
  message(userId) {
    this.app.getRootNav().push(MessagePage, { userId: userId });
  }
}
