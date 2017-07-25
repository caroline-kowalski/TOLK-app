import { Component } from '@angular/core';
import { NavController, AlertController, NavParams, App } from 'ionic-angular';
import { LogoutProvider } from '../../providers/logout';
import { LoadingProvider } from '../../providers/loading';
import { AlertProvider } from '../../providers/alert';
import { ImageProvider } from '../../providers/image';
import { DataProvider } from '../../providers/data';
import { AngularFireDatabase } from 'angularfire2/database';
import { Validator } from '../../validator';
import { Login } from '../../login';
import * as firebase from 'firebase';
import { Camera } from '@ionic-native/camera';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  private user: any;
  private alert;
  // HomePage
  // Ceci est la page où l'utilisateur est dirigé après la connexion réussie et le courrier électronique est confirmé.
   // Une fonction de gestion de profil est disponible pour l'utilisateur dans cette page, par exemple:
   // Modifier le nom, l'image du profil, le courrier électronique et le mot de passe
   // L'utilisateur peut également opter pour la suppression de son compte et finalement se déconnecter.
  constructor(public navCtrl: NavController, public alertCtrl: AlertController, public navParams: NavParams, public app: App,
    public logoutProvider: LogoutProvider, public loadingProvider: LoadingProvider, public imageProvider: ImageProvider,
    public angularfire: AngularFireDatabase, public alertProvider: AlertProvider, public dataProvider: DataProvider, public camera: Camera) {
    this.logoutProvider.setApp(this.app);
  }

  ionViewDidLoad() {
   // Observez les données utilisateur sur la base de données à utiliser par notre markup html.
     // Chaque fois que l'utilisateurData sur la base de données est mis à jour, il réfléchira automatiquement sur notre variable utilisateur.
   this.loadingProvider.show();
    this.dataProvider.getCurrentUser().subscribe((user) => {
      this.loadingProvider.hide();
      this.user = user;
    });

    if(firebase.auth().currentUser!=null || firebase.auth().currentUser!=undefined ){
      // MAJ token
      this.angularfire.object('/accounts/' + firebase.auth().currentUser.uid).update({
        pushToken: localStorage.getItem('pushToken')
      });
    }
    
  }

 // Changer la photo de profil de l'utilisateur. Utilise imageProvider pour traiter l'image et télécharger sur Firebase et mettre à jour les données utilisateur.
  setPhoto() {
    // Demandez si l'utilisateur veut prendre une photo ou choisir une galerie photo.
    this.alert = this.alertCtrl.create({
      title: 'Modifier la photo de profil',
      message: 'Voulez-vous prendre une photo ou en choisir une à partir de la galerie ?',
      buttons: [
        {
          text: 'Annuler',
          handler: data => { }
        },
        {
          text: 'Choisir à partir de la galerie',
          handler: () => {
            // Appeler imageProvider pour procéder, télécharger, et MAJ la photo de l'utilisateur.
            this.imageProvider.setProfilePhoto(this.user, this.camera.PictureSourceType.PHOTOLIBRARY);
          }
        },
        {
          text: 'Prendre une photo',
          handler: () => {
            // Appeler imageProvider pour procéder, télécharger, et MAJ la photo de l'utilisateur.
            this.imageProvider.setProfilePhoto(this.user, this.camera.PictureSourceType.CAMERA);
          }
        }
      ]
    }).present();
  }

  // Modifier le nom du profil de l'utilisateur, son nom d'utilisateur et sa description.
  setName() {
    this.alert = this.alertCtrl.create({
      title: 'Changer le nom du profil',
      message: "Veuillez entrer un nouveau nom de profil.",
      inputs: [
        {
          name: 'name',
          placeholder: 'Votre nom',
          value: this.user.name
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
            let name = data["name"];
            // Vérifiez si le nom entré est différent du nom actuel
            if (this.user.name != name) {
              // Vérifiez si la longueur du nom est supérieure à cinq caractères
              if (name.length >= Validator.profileNameValidator.minLength) {
                // Vérifiez si le nom contient uniquement des caractères et des chiffres.
                if (Validator.profileNameValidator.pattern.test(name)) {
                  this.loadingProvider.show();
                  let profile = {
                    displayName: name,
                    photoURL: this.user.photoURL
                  };
                  // MAJ le profile sur Firebase
                  firebase.auth().currentUser.updateProfile(profile)
                    .then((success) => {
                      // MAJ userData dans la BD.
                      this.angularfire.object('/accounts/' + this.user.userId).update({
                        name: name
                      }).then((success) => {
                        Validator.profileNameValidator.pattern.test(name); //Refresh validator
                        this.alertProvider.showProfileUpdatedMessage();
                      }).catch((error) => {
                        this.alertProvider.showErrorMessage('profile/error-update-profile');
                      });
                    })
                    .catch((error) => {
                      // Montrer les erreurs
                      this.loadingProvider.hide();
                      let code = error["code"];
                      this.alertProvider.showErrorMessage(code);
                      if (code == 'auth/requires-recent-login') {
                        this.logoutProvider.logout();
                      }
                    });
                } else {
                  this.alertProvider.showErrorMessage('profile/invalid-chars-name');
                }
              } else {
                this.alertProvider.showErrorMessage('profile/name-too-short');
              }
            }
          }
        }
      ]
    }).present();
  }

  //Modifier username
  setUsername() {
    this.alert = this.alertCtrl.create({
      title: 'Modifier le nom d utilisateur',
      message: "Veuillez entrer un nouveau nom d utilisateur.",
      inputs: [
        {
          name: 'username',
          placeholder: 'Votre nom d utilisateur',
          value: this.user.username
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
            let username = data["username"];
           // Vérifiez si le nom d'utilisateur entré est différent du nom d'utilisateur actuel
            if (this.user.username != username) {
              this.dataProvider.getUserWithUsername(username).take(1).subscribe((userList) => {
                if (userList.length > 0) {
                  this.alertProvider.showErrorMessage('profile/error-same-username');
                } else {
                  this.angularfire.object('/accounts/' + this.user.userId).update({
                    username: username
                  }).then((success) => {
                    this.alertProvider.showProfileUpdatedMessage();
                  }).catch((error) => {
                    this.alertProvider.showErrorMessage('profile/error-update-profile');
                  });
                }
              });
            }
          }
        }
      ]
    }).present();
  }

  //Modifier la description
  setDescription() {
    this.alert = this.alertCtrl.create({
      title: 'Modifier la description',
      message: "Veuillez entrer une nouvelle description.",
      inputs: [
        {
          name: 'description',
          placeholder: 'Votre description',
          value: this.user.description
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
          
              // Vérifiez si la description entrée est différente de la description actuelle
            if (this.user.description != description) {
              this.angularfire.object('/accounts/' + this.user.userId).update({
                description: description
              }).then((success) => {
                this.alertProvider.showProfileUpdatedMessage();
              }).catch((error) => {
                this.alertProvider.showErrorMessage('profile/error-update-profile');
              });
            }
          }
        }
      ]
    }).present();
  }



//Modifier la profession
  setProfession() {
    this.alert = this.alertCtrl.create({
      title: 'Modifier la profession',
      message: "Veuillez entrer une nouvelle profession.",
      inputs: [
        {
          name: 'profession',
          placeholder: 'Votre profession',
          value: this.user.profession
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
            let profession = data["profession"];
          
              // Vérifiez si la profession entrée est différente de la description actuelle
            if (this.user.profession != profession) {
              this.angularfire.object('/accounts/' + this.user.userId).update({
                profession: profession
              }).then((success) => {
                this.alertProvider.showProfileUpdatedMessage();
              }).catch((error) => {
                this.alertProvider.showErrorMessage('profile/error-update-profile');
              });
            }
          }
        }
      ]
    }).present();
  }
  // Changer le courrier électronique de l'utilisateur. Utilise Validator.ts pour valider le courrier électronique saisi. Après, mettez à jour les données utilisateur sur la base de données.
   // Lorsque l'utilisateur a changé son courrier électronique, il doit confirmer la nouvelle adresse e-mail.
  setEmail() {
    this.alert = this.alertCtrl.create({
      title: 'Modifier l adresse email',
      message: "Veuillez entrer une nouvelle adresse email.",
      inputs: [
        {
          name: 'email',
          placeholder: 'Votre adresse email',
          value: this.user.email
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
            let email = data["email"];
            // Vérifiez si le courrier électronique entré est différent du courrier électronique actuel
            if (this.user.email != email) {
              // Vérifiez si le courrier électronique est valide.
              if (Validator.profileEmailValidator.pattern.test(email)) {
                this.loadingProvider.show();
                // MAJ email sur Firebase.
                firebase.auth().currentUser.updateEmail(email)
                  .then((success) => {
                    // MAJ userData dans la BD.
                    this.angularfire.object('/accounts/' + this.user.userId).update({
                      email: email
                    }).then((success) => {
                      Validator.profileEmailValidator.pattern.test(email);
                      //Vérifiez si la validation par email est activée, si elle est destinée à verificationPage.
                      if (Login.emailVerification) {
                        if (!firebase.auth().currentUser.emailVerified) {
                          this.navCtrl.setRoot(Login.verificationPage);
                        }
                      }
                    }).catch((error) => {
                      this.alertProvider.showErrorMessage('profile/error-change-email');
                    });
                  })
                  .catch((error) => {
                    //Montrer les erreurs
                    this.loadingProvider.hide();
                    let code = error["code"];
                    this.alertProvider.showErrorMessage(code);
                    if (code == 'auth/requires-recent-login') {
                      this.logoutProvider.logout();
                    }
                  });
              } else {
                this.alertProvider.showErrorMessage('profile/invalid-email');
              }
            }
          }
        }
      ]
    }).present();
  }

// Changer le mot de passe de l'utilisateur, cette option ne s'affiche que pour les utilisateurs enregistrés via Firebase.
   // Le mot de passe actuel est d'abord vérifié, après quoi le nouveau mot de passe doit être saisi deux fois.
   // Utilise le validateur de mot de passe de Validator.ts.
  setPassword() {
    this.alert = this.alertCtrl.create({
      title: 'Modifier le mot de passe',
      message: "Veuillez entrer un nouveau mot de passe.",
      inputs: [
        {
          name: 'currentPassword',
          placeholder: 'Mot de passe actuel',
          type: 'password'
        },
        {
          name: 'password',
          placeholder: 'Nouveau mot de passe',
          type: 'password'
        },
        {
          name: 'confirmPassword',
          placeholder: 'Confirmer le mot de passe',
          type: 'password'
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
            let currentPassword = data["currentPassword"];
            let credential = firebase.auth.EmailAuthProvider.credential(this.user.email, currentPassword);
           // Vérifiez si currentPassword est correct
            this.loadingProvider.show();
            firebase.auth().currentUser.reauthenticateWithCredential(credential)
              .then((success) => {
                let password = data["password"];
                // Vérifiez si le mot de passe saisi n'est pas le même que le mot de passe en cours
                if (password != currentPassword) {
                  if (password.length >= Validator.profilePasswordValidator.minLength) {
                    if (Validator.profilePasswordValidator.pattern.test(password)) {
                      if (password == data["confirmPassword"]) {
                        // MAJ le mdp sur Firebase.
                        firebase.auth().currentUser.updatePassword(password)
                          .then((success) => {
                            this.loadingProvider.hide();
                            Validator.profilePasswordValidator.pattern.test(password);
                            this.alertProvider.showPasswordChangedMessage();
                          })
                          .catch((error) => {
                            this.loadingProvider.hide();
                            let code = error["code"];
                            this.alertProvider.showErrorMessage(code);
                            if (code == 'auth/requires-recent-login') {
                              this.logoutProvider.logout();
                            }
                          });
                      } else {
                        this.alertProvider.showErrorMessage('profile/passwords-do-not-match');
                      }
                    } else {
                      this.alertProvider.showErrorMessage('profile/invalid-chars-password');
                    }
                  } else {
                    this.alertProvider.showErrorMessage('profile/password-too-short');
                  }
                }
              })
              .catch((error) => {
                //Show error
                this.loadingProvider.hide();
                let code = error["code"];
                this.alertProvider.showErrorMessage(code);
              });
          }
        }
      ]
    }).present();
  }
// Supprime le compte utilisateur. Après avoir supprimé l'utilisateur Firebase, les ID utilisateur ainsi que leur image de profil téléchargée sur le stockage seront également supprimés.
   // Si vous avez ajouté d'autres informations ou traces pour le compte, assurez-vous de les comptabiliser lors de la suppression du compte.
 deleteAccount() {
    this.alert = this.alertCtrl.create({
      title: 'Confirmer la suppression',
      message: 'Etes vous sur de vouloir suprimer votre compte ?',
      buttons: [
        {
          text: 'Annuler'
        },
        {
          text: 'Supprimer',
          handler: data => {
            this.loadingProvider.show();
            // Supprimer un utilisateur de Firebase
            firebase.auth().currentUser.delete()
              .then((success) => {
                // Supprimer le profilPic de l'utilisateur sur le stockage Firebase
                this.imageProvider.deleteUserImageFile(this.user);
                // Supprime les données utilisateur sur la base de données
                this.angularfire.object('/accounts/' + this.user.userId).remove().then(() => {
                  this.loadingProvider.hide();
                  this.alertProvider.showAccountDeletedMessage();
                  this.logoutProvider.logout();
                });
              })
              .catch((error) => {
                this.loadingProvider.hide();
                let code = error["code"];
                this.alertProvider.showErrorMessage(code);
                if (code == 'auth/requires-recent-login') {
                  this.logoutProvider.logout();
                }
              });
          }
        }
      ]
    }).present();
  }

  logout() {
    this.alert = this.alertCtrl.create({
      title: 'Confirmer la déconnexion',
      message: 'Etes vous sûr de vouloir vous déconnecter?',
      buttons: [
        {
          text: 'Annuler'
        },
        {
          text: 'Deconnexion',
          handler: data => { this.logoutProvider.logout(); }
        }
      ]
    }).present();
  }
}
