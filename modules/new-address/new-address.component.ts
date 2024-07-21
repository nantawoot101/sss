import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { CallserviceService } from '../services/callservice.service';

@Component({
  selector: 'app-new-address',
  templateUrl: './new-address.component.html',
  styleUrls: ['./new-address.component.css']
})
export class NewAddressComponent implements OnInit {

  userId: number;

  constructor(
    private callService: CallserviceService,
    private formBuilder: FormBuilder,
    private router: Router
  ) { }

  ngOnInit() {
    const userDetail = sessionStorage.getItem("userDetail");
    if (userDetail) {
      const userDetailObj = JSON.parse(userDetail);
      this.userId = userDetailObj.userId;
    } else {
      console.log("ไม่พบข้อมูล");
    }
  }

  addressForm = this.formBuilder.group({
    address: ['', Validators.required],
    district: ['', Validators.required],
    province: ['', Validators.required],
    zipCode: ['', Validators.required],
    recipientFname: ['', Validators.required],
    recipientLname: ['', Validators.required],
    recipientPhone: ['', Validators.required],
    prefecture: ['', Validators.required]
  });

  onSubmit() {
    const data = {
      ...this.addressForm.value,
      userId: this.userId  
    };

    Swal.fire({
      title: 'ต้องการบันทึกที่อยู่?',
      text: "คุณต้องการบันทึกที่อยู่นี้ใช่หรือไม่!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#56C596',
      cancelButtonColor: '#d33',
      confirmButtonText: 'บันทึก',
      cancelButtonText: 'ยกเลิก'
    }).then((result) => {
      if (result.isConfirmed) {
        this.callService.saveAddress(data).subscribe(res => {
          if (res ) {
            console.log('ผลลัพธ์จาก Backend:', res);
            Swal.fire({
              icon: 'success',
              title: 'สำเร็จ!',
              text: 'บันทึกที่อยู่สำเร็จ',
              confirmButtonText: 'ตกลง',
            }).then(() => {
              this.router.navigate(['/address']);
            });
          } else {
            Swal.fire({
              icon: 'warning',
              title: 'บันทึกไม่สำเร็จ!',
              text: 'กรุณาตรวจสอบข้อมูล',
              confirmButtonText: 'ตกลง',
            });
          }
        }, error => {
          console.error('เกิดข้อผิดพลาดในการเรียก Backend:', error);
          Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด!',
            text: 'ไม่สามารถบันทึกที่อยู่ได้ในขณะนี้',
            confirmButtonText: 'ตกลง',
          });
        });
      }        
    });
  }
}
