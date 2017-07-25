import { Component } from '@angular/core';
import { NavController, AlertController, NavParams, App } from 'ionic-angular';
import { LogoutProvider } from '../../providers/logout';
import { LoadingProvider } from '../../providers/loading';
import { AlertProvider } from '../../providers/alert';
import { AngularFireDatabase } from 'angularfire2/database';
import { Validator } from '../../validator';
import * as firebase from 'firebase';

@Component({
  selector: 'page-verification',
  templateUrl: 'verification.html'
})
export class VerificationPage {
  // VerificationPage
// Ceci est la page où l'utilisateur est redirigé lorsque son e-mail nécessite une confirmation.
   // Un intervalle de vérification vérifie chaque seconde, si l'utilisateur a confirmé son adresse électronique.
   // Lorsqu'un compte est confirmé, l'utilisateur est alors dirigé vers HomePage.
  private user: any;
  private alert;
  private checkVerified;
  private emailVerified;
  private isLoggingOut;

  constructor(public navCtrl: NavController, public alertCtrl: AlertController, public navParams: NavParams, public app: App,
    public logoutProvider: LogoutProvider, public loadingProvider: LoadingProvider,
    public angularfire: AngularFireDatabase, public alertProvider: AlertProvider) {
    // Accrochez notre fournisseur de déconnexion avec l'application.
    this.logoutProvider.setApp(this.app);
  }

  ionViewDidLoad() {
    // Définissez nos variables routeGuard sur false, pour ne pas autoriser la révision.
    this.emailVerified = false;
    this.isLoggingOut = false;
    // Obtenez des données utilisateur et envoyez une vérification par e-mail automatiquement.
    this.getUserData();
    this.sendEmailVerification();
    // Créez le vérificateur de vérification électronique.
    var that = this;
    that.checkVerified = setInterval(function() {
      firebase.auth().currentUser.reload();
      if (firebase.auth().currentUser.emailVerified) {
        clearInterval(that.checkVerified);
        that.emailVerified = true;
        that.alertProvider.showEmailVerifiedMessageAndRedirect(that.navCtrl);
      }
    }, 1000);
  }

  ionViewCanLeave(): boolean {
    // RouteGuard pour éviter de quitter cette vue à moins que le courrier électronique ne soit vérifié ou que l'utilisateur se déconnecte.
    if (this.emailVerified || this.isLoggingOut) {
      return true;
    } else {
      return false;
    }
  }

  //Obtenez des données utilisateur de l'utilisateur connecté à Firebase pour afficher le balisage html.
  getUserData() {
    let user = firebase.auth().currentUser;
    var userId, name, provider, img, email;
    let providerData = user.providerData[0];

    userId = user.uid;

// Récupérer le nom de l'utilisateur Firebase
    if (user.displayName || providerData.displayName) {
      name = user.displayName;
      name = providerData.displayName;
    } else {
      name = "tolk.fr";
    }

// Récupérer un fournisseur de l'utilisateur Firebase
    if (providerData.providerId == 'password') {
      provider = "Firebase";
    } else if (providerData.providerId == 'facebook.com') {
      provider = "Facebook";
    } else if (providerData.providerId == 'google.com') {
      provider = "Google";
    }
// Récupérer photoURL à partir de l'utilisateur de Firebase
    if (user.photoURL || providerData.photoURL) {
      img = user.photoURL;
      img = providerData.photoURL;
    } else {
      img = "assets/images/profile.png";
    }

// Récupérer des courriels à partir de l'utilisateur de Firebase
    email = user.email;

// Définit la variable utilisateur pour notre markup html
    this.user = {
      userId: userId,
      name: name,
      provider: provider,
      img: img,
      email: email,
      pushToken: localStorage.getItem('pushToken')
    };
  }
// Envoyer une vérification par courrier électronique au courrier électronique de l'utilisateur.
  sendEmailVerification() {
    this.loadingProvider.show();
    firebase.auth().currentUser.sendEmailVerification()
      .then((success) => {
        this.alertProvider.showEmailVerificationSentMessage(firebase.auth().currentUser.email);
        this.loadingProvider.hide();
      });
  }
// Modifier le courrier électronique de l'utilisateur
  setEmail() {
    this.alert = this.alertCtrl.create({
      title: 'Changer d\'adresse email',
      message: "Veuillez entrer une nouvelle adresse email.",
      inputs: [
        {
          name: 'email',
          placeholder: 'Votre adresse email',
          value: firebase.auth().currentUser.email
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
            //Vérifiez si le courrier électronique entré est différent du courrier électronique actuel
            if (firebase.auth().currentUser.email != email) {
              // Vérifier si l'email est valide
              if (Validator.profileEmailValidator.pattern.test(email)) {
                this.loadingProvider.show();
                // MAJ email sur Firebase
                firebase.auth().currentUser.updateEmail(email)
                  .then((success) => {
                    Validator.profileEmailValidator.pattern.test(email);
                    this.loadingProvider.hide();
                    //Effacez l'intervalle existant car lorsque nous appelons ionViewDidLoad, un autre intervalle sera créé.
                    clearInterval(this.checkVerified);
                    //Appelez ionViewDidLoad à nouveau pour mettre à jour l'utilisateur sur le balisage et envoyer automatiquement le courrier de vérification.
                    this.ionViewDidLoad();
                   // Mettre à jour les données utilisateur sur la base de données si elle existe.
                    firebase.database().ref('accounts/' + firebase.auth().currentUser.uid).once('value')
                      .then((account) => {
                        if (account.val()) {
                          this.angularfire.object('/accounts/' + firebase.auth().currentUser.uid).update({
                            email: email
                          });
                        }
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
// Efface l'intervalle et enregistrez l'utilisateur.
  logout() {
    this.alert = this.alertCtrl.create({
      title: 'Confirmer la déconnexion Logout',
      message: '¨Êtes vous certain de vouloir vous déconnecter ?',
      buttons: [
        {
          text: 'Annuler'
        },
        {
          text: 'Déconnexion',
          handler: data => {
            // Efface l'intervalle de vérification.
            clearInterval(this.checkVerified);
            // Modifier notre routeGuard sur true, pour activer la modification des vues.
            this.isLoggingOut = true;
           
            this.logoutProvider.logout();
          }
        }
      ]
    }).present();
  }
}
