import { Component } from '@angular/core';
import { NavController, NavParams, ModalController, AlertController } from 'ionic-angular';
import { DataProvider } from '../../providers/data';
import { LoadingProvider } from '../../providers/loading';
import { ImageProvider } from '../../providers/image';
import { AlertProvider } from '../../providers/alert';
import { ImageModalPage } from '../image-modal/image-modal';
import { AddMembersPage } from '../add-members/add-members';
import { UserInfoPage } from '../user-info/user-info';
import * as firebase from 'firebase';
import { AngularFireDatabase } from 'angularfire2/database';
import { Camera } from '@ionic-native/camera';

@Component({
  selector: 'page-group-info',
  templateUrl: 'group-info.html'
})
export class GroupInfoPage {
  private groupId: any;
  private group: any;
  private groupMembers: any;
  private alert: any;
  private user: any;
  private subscription: any;
  // GroupInfoPage
  // C'est la page où l'utilisateur peut afficher les informations de groupe, modifier les informations de groupe, ajouter des membres et laisser / supprimer un groupe.
  constructor(public navCtrl: NavController, public navParams: NavParams, public dataProvider: DataProvider,
    public loadingProvider: LoadingProvider, public modalCtrl: ModalController, public alertCtrl: AlertController,
    public alertProvider: AlertProvider, public angularfire: AngularFireDatabase, public imageProvider: ImageProvider, public camera: Camera) { }

  ionViewDidLoad() {
    // Initialiser
    this.groupId = this.navParams.get('groupId');

    // Avoir les détails du groupe.
    this.subscription = this.dataProvider.getGroup(this.groupId).subscribe((group) => {
      if (group.$exists()) {
        this.loadingProvider.show();
        this.group = group;
        if (group.members) {
          group.members.forEach((memberId) => {
            this.dataProvider.getUser(memberId).subscribe((member) => {
              this.addUpdateOrRemoveMember(member);
            });
          });
        }
        this.loadingProvider.hide();
      } else {
        // Le groupe est supprimé, revenir en arriere.
        this.navCtrl.popToRoot();
      }
    });

    // Avoir les détails d'un utilisateur.
    this.dataProvider.getCurrentUser().subscribe((user) => {
      this.user = user;
    });
  }

  // Supprimer abonnement.
  // ionViewDidLeave() {
  //   if(this.deleteSubscription)
  //
  // }

 // Vérifiez si l'utilisateur existe dans le groupe puis ajoutez / mettez à jour l'utilisateur.
 // Si l'utilisateur a déjà quitté le groupe, supprimez l'utilisateur de la liste.
  addUpdateOrRemoveMember(member) {
    if (this.group) {
      if (this.group.members.indexOf(member.$key) > -1) {
        // Utilisateur existe dans ce groupe.
        if (!this.groupMembers) {
          this.groupMembers = [member];
        } else {
          var index = -1;
          for (var i = 0; i < this.groupMembers.length; i++) {
            if (this.groupMembers[i].$key == member.$key) {
              index = i;
            }
          }
          // Ajouter/MAJ l'utilisateur.
          if (index > -1) {
            this.groupMembers[index] = member;
          } else {
            this.groupMembers.push(member);
          }
        }
      } else {
        // L'utilisateur a déjà quitté le groupe, supprimez le membre de la liste.
        var index = -1;
        for (var i = 0; i < this.groupMembers.length; i++) {
          if (this.groupMembers[i].$key == member.$key) {
            index = i;
          }
        }
        if (index > -1) {
          this.groupMembers.splice(index, 1);
        }
      }
    }
  }

  // Voir les infor de l'utilisateur
  viewUser(userId) {
    if (firebase.auth().currentUser.uid != userId)
      this.navCtrl.push(UserInfoPage, { userId: userId });
  }

  // Retour
  back() {
    this.subscription.unsubscribe();
    this.navCtrl.pop();
  }

  // 2largir l'image du groupe.
  enlargeImage(img) {
    let imageModal = this.modalCtrl.create(ImageModalPage, { img: img });
    imageModal.present();
  }

  // Changer le nom du groupe.
  setName() {
    this.alert = this.alertCtrl.create({
      title: 'Modifier le nom du groupe',
      message: "Veuillez entrer un nouveau nom de groupe.",
      inputs: [
        {
          name: 'name',
          placeholder: 'Nom du groupe',
          value: this.group.name
        }
      ],
      buttons: [
        {
          text: 'Annuler',
          handler: data => { }
        },
        {
          text: 'Save',
          handler: data => {
            let name = data["name"];
            if (this.group.name != name) {
              this.loadingProvider.show();
              // Ajouter les messages systeme.
              this.group.messages.push({
                date: new Date().toString(),
                sender: this.user.$key,
                type: 'system',
                message: this.user.name + ' a modifié le nom du groupe à: ' + name + '.',
                icon: 'md-create'
              });
              // MAJ le groupe dans la BD.
              this.dataProvider.getGroup(this.groupId).update({
                name: name,
                messages: this.group.messages
              }).then((success) => {
                this.loadingProvider.hide();
                this.alertProvider.showGroupUpdatedMessage();
              }).catch((error) => {
                this.loadingProvider.hide();
                this.alertProvider.showErrorMessage('group/error-update-group');
              });
            }
          }
        }
      ]
    }).present();
  }

  // Changer l'image du groupe, on demande à l'utilisateur s'ils veulent prendre une photo ou choisir la galerie.
  setPhoto() {
    this.alert = this.alertCtrl.create({
      title: 'Modifier le photo de groupe',
      message: 'Voulez-vous prendre une photo ou la choisir à partir de la galerie ?',
      buttons: [
        {
          text: 'Annuler',
          handler: data => { }
        },
        {
          text: 'Choisir à partir de la galerie',
          handler: () => {
            this.loadingProvider.show();
            // Importe une photo et définissez la photo de groupe, puis renvoie l'objet de groupe comme promesse.
            this.imageProvider.setGroupPhotoPromise(this.group, this.camera.PictureSourceType.PHOTOLIBRARY).then((group) => {
              // Ajouter systeme message.
              this.group.messages.push({
                date: new Date().toString(),
                sender: this.user.$key,
                type: 'system',
                message: this.user.name + ' a changé la photo du groupe.',
                icon: 'ios-camera'
              });
              // MAJ l'image du groupe dans la BD.
              this.dataProvider.getGroup(this.groupId).update({
                img: group.img,
                messages: this.group.messages
              }).then((success) => {
                this.loadingProvider.hide();
                this.alertProvider.showGroupUpdatedMessage();
              }).catch((error) => {
                this.loadingProvider.hide();
                this.alertProvider.showErrorMessage('group/error-update-group');
              });
            });
          }
        },
        {
          text: 'Prendre une photo',
          handler: () => {
            this.loadingProvider.show();
            // Télécharger une photo et configurer la photo de groupe, après-retour, renvoyer l'objet de groupe comme promesse.
            this.imageProvider.setGroupPhotoPromise(this.group, this.camera.PictureSourceType.CAMERA).then((group) => {
              // Ajouter systeme message.
              this.group.messages.push({
                date: new Date().toString(),
                sender: this.user.$key,
                type: 'system',
                message: this.user.name + ' a changé la photo du groupe.',
                icon: 'ios-camera'
              });
              //MAJ l'image du groupe dans la BD
              this.dataProvider.getGroup(this.groupId).update({
                img: group.img,
                messages: this.group.messages
              }).then((success) => {
                this.loadingProvider.hide();
                this.alertProvider.showGroupUpdatedMessage();
              }).catch((error) => {
                this.loadingProvider.hide();
                this.alertProvider.showErrorMessage('group/error-update-group');
              });
            });
          }
        }
      ]
    }).present();
  }

  // Changer la description du groupe.
  setDescription() {
    this.alert = this.alertCtrl.create({
      title: 'Changer la description du groupe',
      message: "Veuillez entrer une nouvelle description du groupe.",
      inputs: [
        {
          name: 'description',
          placeholder: 'Description du groupe',
          value: this.group.description
        }
      ],
      buttons: [
        {
          text: 'Annuler',
          handler: data => { }
        },
        {
          text: 'Sauvegarder',
          handler: data => {
            let description = data["description"];
            if (this.group.description != description) {
              this.loadingProvider.show();
              // Ajouter systeme, message.
              this.group.messages.push({
                date: new Date().toString(),
                sender: this.user.$key,
                type: 'system',
                message: this.user.name + ' a changé la description du groupe.',
                icon: 'md-clipboard'
              });
              // MAJ le groupe dans la BD.
              this.dataProvider.getGroup(this.groupId).update({
                description: description,
                messages: this.group.messages
              }).then((success) => {
                this.loadingProvider.hide();
                this.alertProvider.showGroupUpdatedMessage();
              }).catch((error) => {
                this.loadingProvider.hide();
                this.alertProvider.showErrorMessage('group/error-update-group');
              });
            }
          }
        }
      ]
    }).present();
  }

  // Quitter le groupe.
  leaveGroup() {
    this.alert = this.alertCtrl.create({
      title: 'Quitter le groupe',
      message: 'Êtes vous certain de vouloir quitter ce groupe ?',
      buttons: [
        {
          text: 'Annuler'
        },
        {
          text: 'Quitter',
          handler: data => {
            this.loadingProvider.show();
            // Effacer des membres du groupe.
            this.group.members.splice(this.group.members.indexOf(this.user.$key), 1);
            // Ajouter systeme message.
            this.group.messages.push({
              date: new Date().toString(),
              sender: this.user.$key,
              type: 'system',
              message: this.user.name + ' a quitté le groupe.',
              icon: 'md-log-out'
            });
            // MAJ groupe dans la BD.
            this.dataProvider.getGroup(this.groupId).update({
              members: this.group.members,
              messages: this.group.messages
            }).then((success) => {
              // Effacer le groupe de la liste.
              this.angularfire.object('/accounts/' + firebase.auth().currentUser.uid + '/groups/' + this.groupId).remove().then(() => {
                // Pop cette vue car l'utilisateur a déjà quitté ce groupe.
                this.group = null;
                setTimeout(() => {
                  this.loadingProvider.hide();
                  this.navCtrl.popToRoot();
                }, 300);
              });
            }).catch((error) => {
              this.alertProvider.showErrorMessage('group/error-leave-group');
            });
          }
        }
      ]
    }).present();
  }

  // Supprimer le groupe.
  deleteGroup() {
    this.alert = this.alertCtrl.create({
      title: 'Suppression',
      message: 'Êtes vous certain de vouloir supprimer ce groupe?',
      buttons: [
        {
          text: 'Annuler'
        },
        {
          text: 'Supprimer',
          handler: data => {
            let group = JSON.parse(JSON.stringify(this.group));
           // Supprime toutes les images des messages d'image.
            group.messages.forEach((message) => {
              if (message.type == 'image') {
                console.log("Supprimer: " + message.url + " de " + group.$key);
                this.imageProvider.deleteGroupImageFile(group.$key, message.url);
              }
            });
            // Supprimer l'image du groupe.
            console.log("Supprimer: " + group.img);
            this.imageProvider.deleteImageFile(group.img);
            this.angularfire.object('/accounts/' + firebase.auth().currentUser.uid + '/groups/' + group.$key).remove().then(() => {
              this.dataProvider.getGroup(group.$key).remove();
            });
          }
        }
      ]
    }).present();
  }

  // Ajouter des membres.
  addMembers() {
    this.navCtrl.push(AddMembersPage, { groupId: this.groupId });
  }
}
