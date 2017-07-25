import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { LoginProvider } from '../../providers/login';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Validator } from '../../validator';

@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {
  private mode: string;
  private emailPasswordForm: FormGroup;
  private emailForm: FormGroup;
  // LoginPage
  // C'est la page où l'utilisateur peut s'inscrire et se connecter à notre application.
   // Il est important d'initialiser le loginProvider ici et de définirNavController car il guidera les itinéraires de notre application.
  constructor(public navCtrl: NavController, public loginProvider: LoginProvider, public formBuilder: FormBuilder) {
    // Il est important d'accrocher navController à notre loginProvider.
    this.loginProvider.setNavController(this.navCtrl);
    // Créez nos formulaires et leurs validateurs basés sur les validateurs définis sur validator.ts.
    this.emailPasswordForm = formBuilder.group({
      email: Validator.emailValidator,
      password: Validator.passwordValidator
    });
    this.emailForm = formBuilder.group({
      email: Validator.emailValidator
    });
  }

  ionViewDidLoad() {
    // Modifier le mode de vue pour main.
    this.mode = 'main';
  }

  // Appelez loginProvider et connectez-vous à l'utilisateur avec un email et un mot de passe.
   // Vous vous demandez peut-être la fonction de connexion pour Facebook et Google.
   // Ils sont appelés directement depuis le balisage html via loginProvider.facebookLogin () et loginProvider.googleLogin ().
  login() {
    this.loginProvider.emailLogin(this.emailPasswordForm.value["email"], this.emailPasswordForm.value["password"]);
  }

  // Appelez loginProvider et enregistrez l'utilisateur avec un email et un mot de passe.
  register() {
    this.loginProvider.register(this.emailPasswordForm.value["email"], this.emailPasswordForm.value["password"]);
  }

  // Appelez loginProvider et envoyez un email de réinitialisation de mot de passe.
  forgotPassword() {
    this.loginProvider.sendPasswordReset(this.emailForm.value["email"]);
    this.clearForms();
  }

  // Nettoyer les formulaires.
  clearForms() {
    this.emailPasswordForm.reset();
    this.emailForm.reset();
  }

}
