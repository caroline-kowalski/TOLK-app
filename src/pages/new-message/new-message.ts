import { Component } from '@angular/core';
import { NavController, NavParams, App } from 'ionic-angular';
import { SearchPeoplePage } from '../search-people/search-people';
import { MessagePage } from '../message/message';
import { DataProvider } from '../../providers/data';
import { LoadingProvider } from '../../providers/loading';

@Component({
  selector: 'page-new-message',
  templateUrl: 'new-message.html'
})
export class NewMessagePage {
  private friends: any;
  private searchFriend: any;
  // NewMessagePage
  // Il s'agit de la page où l'utilisateur est prié de sélectionner un ami avec lequel il souhaite commencer une conversation.
  constructor(public navCtrl: NavController, public navParams: NavParams, public app: App, public dataProvider: DataProvider,
    public loadingProvider: LoadingProvider) { }

  ionViewDidLoad() {
    // Initialiser
    this.searchFriend = '';
    this.loadingProvider.show();

    // Obtenir les amis de l'utilisateur.
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

  // Retourner
  back() {
    this.navCtrl.pop();
  }
// Ajouter ou mettre à jour un ami pour la synchronisation en temps réel.
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

  // Chercher des personnes.
  searchPeople() {
    this.navCtrl.push(SearchPeoplePage);
  }

  // Ouvrir le chat avec un utilisateur.
  message(userId) {
    this.navCtrl.push(MessagePage, { userId: userId });
  }
}
