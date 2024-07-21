import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { CallserviceService } from '../services/callservice.service';
import { DataSharingService } from '../DataSharingService';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private callService: CallserviceService,
    private dataSharingService: DataSharingService
  ) { }

  ngOnInit() {
    sessionStorage.removeItem("userDetail");
    sessionStorage.removeItem("userId");
    console.log(sessionStorage.removeItem("userId"));
  }

  loginForm = this.formBuilder.group({
    userName: '',
    password: '',
  });

  onSubmit() {
    const userName = this.loginForm.value.userName;
    const password = this.loginForm.value.password;
    this.callService.authen(userName, password).subscribe(res => {
      if (res.data) {
        Swal.fire({
          icon: 'success',
          title: 'สำเร็จ',
          text: 'เข้าสู่ระบบสำเร็จ',
          confirmButtonText: 'ตกลง'
        });

        sessionStorage.setItem("userDetail", JSON.stringify(res.data));
        sessionStorage.setItem("userId", res.data.userId);
        this.dataSharingService.userDetail.next(true);

        const roleId = res.data.roleId;
        if (roleId === 1) {
          this.router.navigate(['/dash-board-admin']);
        } else if (roleId === 2) {
          this.router.navigate(['/']);
        } else {
          Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด!',
            text: 'ไม่พบหน้าที่คุณต้องการ',
            confirmButtonText: 'ตกลง',
          });
        }
      } else {
        Swal.fire({
          icon: 'warning',
          title: 'เข้าสู่ระบบไม่สำเร็จ!',
          text: 'กรุณาลองใหม่อีกครั้ง',
          confirmButtonText: 'ตกลง',
        });
      }
    });
  }
}
