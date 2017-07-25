import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, App } from 'ionic-angular';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ImageProvider } from '../../providers/image';
import { LoadingProvider } from '../../providers/loading';
import { DataProvider } from '../../providers/data';
import { AlertProvider } from '../../providers/alert';
import { Validator } from '../../validator';
import { Camera } from '@ionic-native/camera';
import { AngularFireDatabase } from 'angularfire2/database';
import { GroupPage } from '../group/group';
import * as firebase from 'firebase';
import { SearchPeoplePage } from '../search-people/search-people';

@Component({
  selector: 'page-new-group',
  templateUrl: 'new-group.html'
})
export class NewGroupPage {
  private group: any;
  private groupForm: FormGroup;
  private friends: any;
  private searchFriend: any;
  private groupMembers: any;
  private alert: any;
  // NewGroupPage
 //C'est la page où l'utilisateur peut lancer un nouveau chat collectif avec ses amis.
  constructor(public navCtrl: NavController, public navParams: NavParams, public imageProvider: ImageProvider, public dataProvider: DataProvider, public formBuilder: FormBuilder,
    public alertProvider: AlertProvider, public alertCtrl: AlertController, public angularfire: AngularFireDatabase, public app: App, public loadingProvider: LoadingProvider, public camera: Camera) {
    // Créez notre groupForm basé sur Validator.ts
    this.groupForm = formBuilder.group({
      name: Validator.groupNameValidator,
      description: Validator.groupDescriptionValidator
    });
  }

  ionViewDidLoad() {
    // Initialiser
    this.group = {
      img: 'assets/images/set.png'
    };
    this.searchFriend = '';
// Obtenez les amis de l'utilisateur pour ajouter au groupe.
    this.dataProvider.getCurrentUser().subscribe((account) => {
      if (!this.groupMembers) {
        this.groupMembers = [account]
      }
      if (account.friends) {
        for (var i = 0; i < account.friends.length; i++) {
          this.dataProvider.getUser(account.friends[i]).subscribe((friend) => {
            this.addOrUpdateFriend(friend);
          });
        }
      } else {
        this.friends = [];
      }
    });
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

  // Retour 
  back() {
    if (this.group)
      this.imageProvider.deleteImageFile(this.group.img);
    this.navCtrl.pop();
  }

  // Traitement de la creation de groupe.
  done() {
    this.loadingProvider.show();
    var messages = []; 
    //Ajouter un message système que le groupe est créé.
    messages.push({
      date: new Date().toString(),
      sender: firebase.auth().currentUser.uid,
      type: 'system',
      message: 'Ce groupe a été créé.',
      icon: 'md-chatbubbles'
    });
    // Ajout des membres du groupe
    var members = [];
    for (var i = 0; i < this.groupMembers.length; i++) {
      members.push(this.groupMembers[i].$key);
    }
    // Ajout des info et date du groupe.
    this.group.dateCreated = new Date().toString();
    this.group.messages = messages;
    this.group.members = members;
    this.group.name = this.groupForm.value["name"];
    this.group.description = this.groupForm.value["description"];
    // Ajout du groupe dans la database.
    this.angularfire.list('groups').push(this.group).then((success) => {
      let groupId = success.key;
      // Ajout du groupe reference à un utilisateur.
      this.angularfire.object('/accounts/' + this.groupMembers[0].$key + '/groups/' + groupId).update({
        messagesRead: 1
      });
      for (var i = 1; i < this.groupMembers.length; i++) {
        this.angularfire.object('/accounts/' + this.groupMembers[i].$key + '/groups/' + groupId).update({
          messagesRead: 0
        });
      }
      //Ouvrir le groupe de discussion du groupe juste créé.
      this.navCtrl.popToRoot().then(() => {
        this.loadingProvider.hide();
        this.app.getRootNav().push(GroupPage, { groupId: groupId });
      });
    });
  }
// Ajoutez un ami aux membres du groupe.
  addToGroup(friend) {
    this.groupMembers.push(friend);
  }

  // Supprimer un ami des membres du groupe.
  removeFromGroup(friend) {
    var index = -1;
    for (var i = 1; i < this.groupMembers.length; i++) {
      if (this.groupMembers[i].$key == friend.$key) {
        index = i;
      }
    }
    if (index > -1) {
      this.groupMembers.splice(index, 1);
    }
  }

// Vérifiez si un ami est déjà ajouté au groupe.
  inGroup(friend) {
    for (var i = 0; i < this.groupMembers.length; i++) {
      if (this.groupMembers[i].$key == friend.$key) {
        return true;
      }
    }
    return false;
  }
// Bascule pour ajouter / supprimer un ami du groupe.
  addOrRemoveFromGroup(friend) {
    if (this.inGroup(friend)) {
      this.removeFromGroup(friend);
    } else {
      this.addToGroup(friend);
    }
  }

  // Modifier la photo de groupe.
  setGroupPhoto() {
    this.alert = this.alertCtrl.create({
      title: 'Modifier la photo de groupe',
      message: 'Voulez vous prendre une photo ou la choisir à partir de la galerie?',
      buttons: [
        {
          text: 'Annuler',
          handler: data => { }
        },
        {
          text: 'Choisir à partir de la galerie',
          handler: () => {
            this.imageProvider.setGroupPhoto(this.group, this.camera.PictureSourceType.PHOTOLIBRARY);
          }
        },
        {
          text: 'Prendre une photo',
          handler: () => {
            this.imageProvider.setGroupPhoto(this.group, this.camera.PictureSourceType.CAMERA);
          }
        }
      ]
    }).present();
  }
// Rechercher des personnes à ajouter en tant qu'ami.
  searchPeople() {
    this.navCtrl.push(SearchPeoplePage);
  }
}
