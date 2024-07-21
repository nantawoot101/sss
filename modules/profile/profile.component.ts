import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CallserviceService } from '../services/callservice.service';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  constructor(
    private formBuilder: FormBuilder,
    private callService: CallserviceService,
    private router: Router,
    private activated: ActivatedRoute,
  ) { }

  userDetail: any;
  userId: any;
  title: any;
  profilePicture: File | null = null;
  imgBaseUrl = environment.API_ENDPOINT + '/upload/input/profile/';
  updateForm: FormGroup;
  showPassword: boolean = false;

  ngOnInit() {
    this.updateForm = this.formBuilder.group({
      firstName: [''],
      lastName: [''],
      phone: [''],
      age: [''],
      email: [''],
      userName: [''],
      password: [''],
      profilePicture: ['']
    });
  
    this.userId = this.activated.snapshot.paramMap.get('userId');
    if (this.userId) {
      this.callService.getByUserId(this.userId).subscribe(res => {
        if (res.data) {
          this.title = "แก้ไขข้อมูลของผู้ใช้"
          this.userDetail = res.data
          this.setDataForm(this.userDetail)
        }
      })
    } else {
      this.title = "แก้ไขข้อมูลของคุณ"
      let userDetailSession: any = sessionStorage.getItem('userDetail');
      this.userDetail = JSON.parse(userDetailSession);
      this.setDataForm(this.userDetail)
    }
  }
  
  setDataForm(data: any) {
    this.updateForm.patchValue({
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      age: data.age,
      email: data.email,
      userName: data.userName,
      password: data.password
    });
  
    if (data.userImgName) {
      this.userDetail.userImgPath = this.imgBaseUrl + data.userImgName;
    } else {
      this.userDetail.userImgPath = null;
    }
  }

  onSubmit() {
    const formData = new FormData();
    const formValues = this.updateForm.getRawValue();

    formData.append('firstName', formValues.firstName);
    formData.append('lastName', formValues.lastName);
    formData.append('phone', formValues.phone);
    formData.append('age', formValues.age);
    formData.append('email', formValues.email);
    formData.append('userName', formValues.userName);
    formData.append('password', formValues.password);

    if (this.profilePicture) {
      formData.append('file', this.profilePicture);
    }

    this.callService.upDateUserData(formData, this.userDetail.userId).subscribe(res => {
      if (res.data) {
        Swal.fire({
          icon: 'success',
          title: 'สำเร็จ!',
          text: 'แก้ไขข้อมูลสำเร็จ',
          confirmButtonText: 'ตกลง',
        });

        if (this.userId) {
          this.router.navigate(['/profile/' + this.userId]);
        } else {
          this.getUserById(res.data);
          this.router.navigate(['/profile']);
        }
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

  getUserById(userId: any) {
    this.callService.getByUserId(userId).subscribe(res => {
      if (res.data) {
        this.userDetail = res.data;
        this.setDataForm(this.userDetail);
        sessionStorage.removeItem("userDetail");
        sessionStorage.setItem("userDetail", JSON.stringify(res.data));
      }
    });
  }

  onFileSelected(event: any) {
    if (event.target.files.length > 0) {
      this.profilePicture = event.target.files[0] as File;

      const reader = new FileReader();
      reader.onload = () => {
        this.userDetail.userImgPath = reader.result as string;
      };
      reader.readAsDataURL(this.profilePicture);
    }
  }

  removeProfile() {
    this.userDetail.userImgPath = null;
    this.profilePicture = null;
  }
}
