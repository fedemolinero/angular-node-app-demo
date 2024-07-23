import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService } from '@services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit, OnDestroy {

  private loginSubscription!: Subscription;
  loginForm!: FormGroup;

  // Attempt control FE
  maxAttempts: number = 3;
  attempts: number = 0;
  disabledLogin: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.initLoginForm();
    this.loadAttemptsFromStorage();
  }

  ngOnDestroy(): void {
    if (this.loginSubscription) {
      this.loginSubscription.unsubscribe();
    }
  }

  initLoginForm() {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  loadAttemptsFromStorage() {
    const storedAttempts = localStorage.getItem('loginAttempts');
    if (storedAttempts) {
      this.attempts = parseInt(storedAttempts, 10);
    }
  }

  saveAttemptsToStorage() {
    localStorage.setItem('loginAttempts', this.attempts.toString());
  }

  clearAttemptsFromStorage() {
    localStorage.removeItem('loginAttempts');
  }

  get username() { return this.loginForm.get('username'); }
  get password() { return this.loginForm.get('password'); }

  login() {
    if (this.disabledLogin) {
      return;
    }

    if (this.attempts >= this.maxAttempts) {
      this.disabledLogin = true;
      setTimeout(() => {
        this.attempts = 0;
        this.disabledLogin = false;
        this.clearAttemptsFromStorage(); // Limpiar intentos en el almacenamiento
      }, 60000); // Bloquea el inicio de sesión durante 1 minuto
      return;
    }

    this.loginSubscription = this.authService.login(
      this.loginForm.controls['username'].value,
      this.loginForm.controls['password'].value
    ).subscribe(
      {
        next: (response: any) => {
          this.router.navigate(['/cv']);
        },
        error: (error) => {

          // Si falla, incrementamos el contador de intentos
          this.attempts++;
          this.saveAttemptsToStorage(); // Guardar intentos en el almacenamiento
          // Mostrar mensaje de contraseña incorrecta y enfocar el campo de password
          if (error.status == 401) {
            this.loginForm.controls['password'].setErrors({ 'is-invalid': true });
          }

        }
      }
    );
  }
}
