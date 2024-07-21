import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CallserviceService } from '../services/callservice.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  register: FormGroup;
  isPassword: boolean;
  selectedFile: File | null = null;
  selectedFileImg: any[] = [];
  showPassword: boolean = false;

  constructor(
    private router: Router, 
    private callService: CallserviceService,
    private formBuilder: FormBuilder,
    private activated: ActivatedRoute
  ) { 
    this.register = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      phone: ['', Validators.required],
      age: ['', Validators.required],
      email: ['', Validators.required],
      userName: ['', Validators.required],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
      file: []
    });
  }

  ngOnInit() {}

  onSubmit() {
    this.isPassword = false;
    if (this.passwordValidate()) {
      const formData = new FormData();
      formData.append('firstName', this.register.get('firstName')!.value);
      formData.append('lastName', this.register.get('lastName')!.value);
      formData.append('phone', this.register.get('phone')!.value);
      formData.append('age', this.register.get('age')!.value);
      formData.append('email', this.register.get('email')!.value);
      formData.append('userName', this.register.get('userName')!.value);
      formData.append('password', this.register.get('password')!.value);
      formData.append('confirmPassword', this.register.get('confirmPassword')!.value);
  
      if (this.selectedFile) {
        formData.append('file', this.selectedFile, this.selectedFile.name);
      }
      
      Swal.fire({
        title: 'ต้องการสมัครสมาชิก?',
        text: 'คุณต้องการสมัครสมาชิกใช่หรือไม่!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#56C596',
        cancelButtonColor: '#d33',
        confirmButtonText: 'บันทึก',
        cancelButtonText: 'ยกเลิก'
      }).then((result) => {
        if (result.isConfirmed) {
          this.callService.saveRegister(formData).subscribe(res => {
            if (res) {
              Swal.fire({
                icon: 'success',
                title: 'สำเร็จ!',
                text: 'สมัครสมาชิกสำเร็จ',
                confirmButtonText: 'ตกลง',
              }).then(() => {
                this.router.navigate(['/login']);
              });
            } else {
              Swal.fire({
                icon: 'warning',
                title: 'บันทึกไม่สำเร็จ!',
                text: 'กรุณาตรวจสอบข้อมูล',
                confirmButtonText: 'ตกลง',
              });
            }
          });
        }
      });
    }
  }

  passwordValidate() {
    const password = this.register.get('password')!.value;
    const confirmPassword = this.register.get('confirmPassword')!.value;

    if (password !== confirmPassword) {
      this.isPassword = true;
      return false;
    } else {
      return true;
    }
  }

  onFileSelected(event: any) {
    if (event.target.files.length > 0) {
      this.selectedFile = event.target.files[0] as File;

      const reader = new FileReader();
      reader.onload = () => {
        this.selectedFileImg.push({
          file: this.selectedFile,
          url: reader.result as string
        });
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }
}
