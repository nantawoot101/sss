// address.component.ts

import { Component, OnInit } from '@angular/core';
import { CallserviceService } from '../services/callservice.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-address',
  templateUrl: './address.component.html',
  styleUrls: ['./address.component.css']
})
export class AddressComponent implements OnInit {
  userId: number; // ประกาศตัวแปร userId สำหรับเก็บค่า userId ที่ได้จาก sessionStorage
  userAddresses: any[] = [];

  constructor(
    private callService: CallserviceService,
    private router: Router
  ) { }

  ngOnInit() {
    // ดึงข้อมูล userId จาก sessionStorage เมื่อโหลด component
    const userDetail = sessionStorage.getItem("userDetail");
    if (userDetail) {
      const userDetailObj = JSON.parse(userDetail);
      this.userId = userDetailObj.userId;

      // ดึงข้อมูลที่อยู่ของผู้ใช้จาก API
      this.callService.getByAddressUserId(this.userId).subscribe(data => {
        if (data && data.data) {
          this.userAddresses = data.data;
        } else {
          console.error('ไม่พบข้อมูลที่อยู่สำหรับผู้ใช้ ID:', this.userId);
        }
      });
    } else {
      // กรณีที่ไม่พบข้อมูล userDetail ใน sessionStorage ให้ redirect ไปยังหน้า login
      this.router.navigate(['/login']);
    }
  }

  onNewAddress() {
    this.router.navigate(['/new-address']);
  }

  onUpdateAddress() {
    this.router.navigate(['/update-address']);
  }

  onDeleteAddress(addressId: number) {
    Swal.fire({
      title: 'ต้องการลบที่อยู่นี้?',
      text: "คุณต้องการลบที่อยู่นี้ใช่หรือไม่!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#DD6B55',
      confirmButtonText: 'ใช่, ลบ!',
      cancelButtonText: 'ยกเลิก'
    }).then((result) => {
      if (result.isConfirmed) {
        this.callService.deleteByAddress(addressId).subscribe(res => {
          if (res && res.status === 'SUCCESS') {
            Swal.fire({
              icon: 'success',
              title: 'สำเร็จ!',
              text: 'ลบที่อยู่สำเร็จ',
              confirmButtonText: 'ตกลง',
            }).then(() => {
              
              window.location.reload();
            });
          } else {
            Swal.fire({
              icon: 'error',
              title: 'เกิดข้อผิดพลาด!',
              text: 'ไม่สามารถลบที่อยู่ได้ในขณะนี้',
              confirmButtonText: 'ตกลง',
            });
          }
        });
      }
    });
  }


}
