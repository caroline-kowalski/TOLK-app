import { Component } from '@angular/core';
import { NavController, NavParams, App } from 'ionic-angular';
import { NewGroupPage } from '../new-group/new-group';
import { DataProvider } from '../../providers/data';
import { LoadingProvider } from '../../providers/loading';
import { GroupPage } from '../group/group';

@Component({
  selector: 'page-groups',
  templateUrl: 'groups.html'
})
export class GroupsPage {
  private groups: any;
  private searchGroup: any;
  private updateDateTime: any;
  // GroupsPage
  // C'est la page où l'utilisateur peut ajouter, afficher et rechercher des groupes.
  constructor(public navCtrl: NavController, public navParams: NavParams, public app: App, public dataProvider: DataProvider, public loadingProvider: LoadingProvider) { }

  ionViewDidLoad() {
    // Initialiser
    this.searchGroup = '';
    this.loadingProvider.show();

    // Avoir les groupes
    this.dataProvider.getGroups().subscribe((groupIds) => {
      if (groupIds.length > 0) {
        if(this.groups && this.groups.length > groupIds.length) {
          //L'utilisateur a laissé / supprimé un groupe, effacez la liste et ajoutez ou mettez à jour chaque groupe à nouveau.
          this.groups = [];
        }
        groupIds.forEach((groupId) => {
          this.dataProvider.getGroup(groupId.$key).subscribe((group) => {
            if (group.$exists()) {
              //Avoir du groupe le unreadMessagesCount
              group.unreadMessagesCount = group.messages.length - groupId.messagesRead;
              //Obtenir la dernière date active du groupe
              group.date = group.messages[group.messages.length - 1].date;
              this.addOrUpdateGroup(group);
            }
          });
        });
        this.loadingProvider.hide();
      } else {
        this.groups = [];
        this.loadingProvider.hide();
      }
    });

    //Mise à jour de la dernière date active des groupes écoulés à chaque minute en fonction de Moment.js.
    var that = this;
    if (!that.updateDateTime) {
      that.updateDateTime = setInterval(function() {
        if (that.groups) {
          that.groups.forEach((group) => {
            let date = group.date;
            group.date = new Date(date);
          });
        }
      }, 60000);
    }
  }

  // Ajouter ou mettre à jour le groupe pour la synchronisation en temps réel en fonction de notre observateur.
  addOrUpdateGroup(group) {
    if (!this.groups) {
      this.groups = [group];
    } else {
      var index = -1;
      for (var i = 0; i < this.groups.length; i++) {
        if (this.groups[i].$key == group.$key) {
          index = i;
        }
      }
      if (index > -1) {
        this.groups[index] = group;
      } else {
        this.groups.push(group);
      }
    }
  }

//Supprimez le groupe, car le groupe a déjà été supprimé.
  // removeGroup(group) {
  //   if (this.groups) {
  //     var index = -1;
  //     for (var i = 0; i < this.groups.length; i++) {
  //       if (this.groups[i].$key == group.$key) {
  //         index = i;
  //       }
  //     }
  //     if (index > -1) {
  //       this.groups.splice(index, 1);
  //     }
  //   }
  // }

  // Nouveau Groupe.
  newGroup() {
    this.app.getRootNav().push(NewGroupPage);
  }

  // Ouvrir un chat de Groupe.
  viewGroup(groupId) {
    this.app.getRootNav().push(GroupPage, { groupId: groupId });
  }
  //Classe de retour basée si le groupe a des messages non lus (unreadMessages) ou non.
  hasUnreadMessages(group) {
    if (group.unreadMessagesCount > 0) {
      return 'group bold';
    } else
      return 'group';
  }
}
