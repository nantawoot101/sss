import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { CallserviceService } from '../services/callservice.service';

@Component({
  selector: 'app-update-address',
  templateUrl: './update-address.component.html',
  styleUrls: ['./update-address.component.css']
})
export class UpdateAddressComponent implements OnInit {

  userId: number;
  userAddresses: any[] = [];
  addressId: number;

  constructor(
    private callService: CallserviceService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    const userDetail = sessionStorage.getItem("userDetail");
    if (userDetail) {
      const userDetailObj = JSON.parse(userDetail);
      this.userId = userDetailObj.userId;

      this.callService.getByAddressUserId(this.userId).subscribe(data => {
        if (data && data.data) {
          this.userAddresses = data.data;

          if (this.userAddresses.length > 0) {
            const defaultAddress = this.userAddresses[0];
            this.addressId = defaultAddress.id; 
            this.addressForm.patchValue({
              address: defaultAddress.address,
              district: defaultAddress.district,
              province: defaultAddress.province,
              zipCode: defaultAddress.zipCode,
              recipientFname: defaultAddress.recipientFname,
              recipientLname: defaultAddress.recipientLname,
              recipientPhone: defaultAddress.recipientPhone,
              prefecture: defaultAddress.prefecture
            });
          } else {
            console.error('ไม่พบที่อยู่ที่ต้องการอัปเดต');
          }
        } else {
          console.error('ไม่พบข้อมูลที่อยู่สำหรับผู้ใช้ ID:', this.userId);
        }
      });
    } else {
      this.router.navigate(['/login']);
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
      userId: this.userId,
      id: this.addressId // Ensure we are passing the address ID for the update
    };

    Swal.fire({
      title: 'ต้องการบันทึกที่อยู่?',
      text: "คุณต้องการบันทึกการเปลี่ยนแปลงนี้ใช่หรือไม่!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#56C596',
      cancelButtonColor: '#d33',
      confirmButtonText: 'บันทึก',
      cancelButtonText: 'ยกเลิก'
    }).then((result) => {
      if (result.isConfirmed) {
        this.callService.upDateAddressData(data, this.userId).subscribe(res => {
          if (res) {
            Swal.fire({
              icon: 'success',
              title: 'สำเร็จ!',
              text: 'บันทึกการเปลี่ยนแปลงสำเร็จ',
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
