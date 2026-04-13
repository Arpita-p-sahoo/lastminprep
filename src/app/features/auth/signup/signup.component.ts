import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
})
export class SignupComponent {
  auth = inject(AuthService);
  form = { firstName: '', lastName: '', email: '', dob: '', gender: '', organisation: '', designation: '', experience: '1–3 yrs', age: 0, avatar: '', linkedinUrl: '', password: '' };
  signup(): void {
    this.auth.signup({
      name: `${this.form.firstName} ${this.form.lastName}`.trim(),
      email: this.form.email,
      designation: this.form.designation,
      organisation: this.form.organisation,
      experience: this.form.experience,
      age: this.form.age,
      gender: this.form.gender,
      dob: this.form.dob,
      linkedinUrl: this.form.linkedinUrl,
      avatar: this.form.avatar,
      password: this.form.password,
    });
  }
}
