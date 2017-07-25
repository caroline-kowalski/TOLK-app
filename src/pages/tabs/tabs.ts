import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { HomePage } from '../home/home';

import { BienvenuePage } from '../bienvenue/bienvenue';
import { NotesPage } from '../notes/notes';
import { MessagesPage } from '../messages/messages';
import { GroupsPage } from '../groups/groups';
import { FriendsPage } from '../friends/friends';
import { DataProvider } from '../../providers/data';
import * as firebase from 'firebase';

@Component({
  selector: 'page-tabs',
  templateUrl: 'tabs.html'
})
export class TabsPage {
  messages: any = MessagesPage;
  groups: any = GroupsPage;
  friends: any = FriendsPage;
  profile: any = HomePage;
  notes: any = NotesPage;
  bienvenue : any = BienvenuePage;
  private unreadMessagesCount: any;
  private friendRequestCount: any;
  private unreadGroupMessagesCount: any;
  private groupList: any;
  private groupsInfo: any;
  private conversationList: any;
  private conversationsInfo: any;
  // TabsPage
  // Ceci est la page où nous avons configuré nos onglets.
  constructor(public navCtrl: NavController, public navParams: NavParams, public dataProvider: DataProvider) {
  }

  ionViewDidLoad() {
    // Obtenez un nombre de demandes d'amis
    this.dataProvider.getRequests(firebase.auth().currentUser.uid).subscribe((requests) => {
      if (requests.friendRequests) {
        this.friendRequestCount = requests.friendRequests.length;
      } else {
        this.friendRequestCount = null;
      }
    });

    // Obtenez des conversations et ajoutez / mettez à jour si la conversation existe, sinon supprimez de la liste.
    this.dataProvider.getConversations().subscribe((conversationsInfo) => {
      this.unreadMessagesCount = null;
      this.conversationsInfo = null;
      this.conversationList = null;
      if (conversationsInfo.length > 0) {
        this.conversationsInfo = conversationsInfo;
        conversationsInfo.forEach((conversationInfo) => {
          this.dataProvider.getConversation(conversationInfo.conversationId).subscribe((conversation) => {
            if (conversation.$exists()) {
              this.addOrUpdateConversation(conversation);
            }
          });
        });
      }
    });

    this.dataProvider.getGroups().subscribe((groupIds) => {
      if (groupIds.length > 0) {
        this.groupsInfo = groupIds;
        if (this.groupList && this.groupList.length > groupIds.length) {
          // L'utilisateur a laissé / supprimé un groupe, effacez la liste et ajoutez ou mettez à jour chaque groupe à nouveau.
          this.groupList = null;
        }
        groupIds.forEach((groupId) => {
          this.dataProvider.getGroup(groupId.$key).subscribe((group) => {
            if (group.$exists()) {
              this.addOrUpdateGroup(group);
            }
          });
        });
      } else {
        this.unreadGroupMessagesCount = null;
        this.groupsInfo = null;
        this.groupList = null;
      }
    });
  }

  // Ajouter ou mettre à jour la conversion pour la synchronisation en temps réel de unreadMessagesCount.
  addOrUpdateConversation(conversation) {
    if (!this.conversationList) {
      this.conversationList = [conversation];
    } else {
      var index = -1;
      for (var i = 0; i < this.conversationList.length; i++) {
        if (this.conversationList[i].$key == conversation.$key) {
          index = i;
        }
      }
      if (index > -1) {
        this.conversationList[index] = conversation;
      } else {
        this.conversationList.push(conversation);
      }
    }
    this.computeUnreadMessagesCount();
  }
// Calcule tous les messages non lus de la conversation.
  computeUnreadMessagesCount() {
    this.unreadMessagesCount = 0;
    if (this.conversationList) {
      for (var i = 0; i < this.conversationList.length; i++) {
        this.unreadMessagesCount += this.conversationList[i].messages.length - this.conversationsInfo[i].messagesRead;
        if (this.unreadMessagesCount == 0) {
          this.unreadMessagesCount = null;
        }
      }
    }
  }

  getUnreadMessagesCount() {
    if (this.unreadMessagesCount) {
      if (this.unreadMessagesCount > 0) {
        return this.unreadMessagesCount;
      }
    }
    return null;
  }
// Ajouter ou mettre à jour le groupe
  addOrUpdateGroup(group) {
    if (!this.groupList) {
      this.groupList = [group];
    } else {
      var index = -1;
      for (var i = 0; i < this.groupList.length; i++) {
        if (this.groupList[i].$key == group.$key) {
          index = i;
        }
      }
      if (index > -1) {
        this.groupList[index] = group;
      } else {
        this.groupList.push(group);
      }
    }
    this.computeUnreadGroupMessagesCount();
  }

  // Supprime le groupe de la liste si le groupe est déjà supprimé.
  removeGroup(groupId) {
    if (this.groupList) {
      var index = -1;
      for (var i = 0; i < this.groupList.length; i++) {
        if (this.groupList[i].$key == groupId) {
          index = i;
        }
      }
      if (index > -1) {
        this.groupList.splice(index, 1);
      }

      index = -1;
      for (var i = 0; i < this.groupsInfo.length; i++) {
        if (this.groupsInfo[i].$key == groupId) {
          index = i;
        }
      }
      if (index > -1) {
        this.groupsInfo.splice(index, 1);
      }
      this.computeUnreadGroupMessagesCount();
    }
  }
// Calculer tous les messages non lus de tous les groupes.
  computeUnreadGroupMessagesCount() {
    this.unreadGroupMessagesCount = 0;
    if (this.groupList) {
      for (var i = 0; i < this.groupList.length; i++) {
        if (this.groupList[i].messages) {
          this.unreadGroupMessagesCount += this.groupList[i].messages.length - this.groupsInfo[i].messagesRead;
        }
        if (this.unreadGroupMessagesCount == 0) {
          this.unreadGroupMessagesCount = null;
        }
      }
    }
  }

  getUnreadGroupMessagesCount() {
    if (this.unreadGroupMessagesCount) {
      if (this.unreadGroupMessagesCount > 0) {
        return this.unreadGroupMessagesCount;
      }
    }
    return null;
  }
}
