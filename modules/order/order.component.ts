import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CallserviceService } from '../services/callservice.service';
import Swal from 'sweetalert2';
import { FormBuilder, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.css']
})
export class OrderComponent implements OnInit {
  userId: number;
  userAddresses: any[] = [];
  cartItems: any[] = [];
  selectedAddress: any;
  paymentMethods: any[] = [];
  selectedPaymentMethod: any;
  qrCodeUrl: string | null = null;
  selectedFile: File | undefined;

  constructor(
    private router: Router,
    private callService: CallserviceService,
    private domSanitizer: DomSanitizer,
    private formBuilder: FormBuilder
  ) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation && navigation.extras.state) {
      this.cartItems = navigation.extras.state['cartItems'];
    }
  }

  ngOnInit() {
    this.getUserAddresses();
    this.getPaymentMethods();
    this.updateQRCodeUrl();
    console.log(this.cartItems)
  }

  getUserAddresses() {
    const userId = sessionStorage.getItem('userId');
    if (userId) {
      this.callService.getByAddressUserId(userId).subscribe(
        res => {
          if (res.data) {
            this.userAddresses = res.data;
          }
        },
        error => {
          console.error('เกิดข้อผิดพลาดในการดึงข้อมูลที่อยู่ของผู้ใช้', error);
        }
      );
    }
  }

  getPaymentMethods() {
    this.callService.getAllPaymentMethod().subscribe(
      res => {
        if (res.data) {
          this.paymentMethods = res.data;
        }
      },
      error => {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูลวิธีการชำระเงิน', error);
      }
    );
  }

  paymentForm = this.formBuilder.group({
    amount: ['', Validators.required],
    paymentStatus: ['pending', Validators.required],
    paymentImgName: [''],
    paymentImgPath: [''],
    approveBy: ['', Validators.required]
  });

  updateQRCodeUrl() {
    this.qrCodeUrl = this.generateQRCodeUrl();
  }
  
  

  generateQRCodeUrl(): string {
    const totalAmount = this.getTotalAmount();
    if (totalAmount) {
      const promptPayNumber = '0613398749';
      return `https://promptpay.io/${promptPayNumber}/${totalAmount}`;
    }
    return '';
  }

  getTotalAmount(): number {
    return this.cartItems.reduce((total, item) => total + item.price * item.cartQuantity, 0);
  }
  
  async placeOrder() {
    const userId = sessionStorage.getItem('userId');
    const formData = new FormData();
    
    if (!userId) {
      Swal.fire('เกิดข้อผิดพลาด', 'ไม่พบข้อมูลผู้ใช้. กรุณาลองใหม่.', 'error');
      return;
    }
  
    // ตรวจสอบข้อมูลที่อยู่
    if (!this.selectedAddress || !this.selectedAddress.id) {
      Swal.fire('เกิดข้อผิดพลาด', 'กรุณาเลือกที่อยู่.', 'error');
      return;
    }
  
    // ตรวจสอบวิธีการชำระเงิน
    if (!this.selectedPaymentMethod || !this.selectedPaymentMethod.id) {
      Swal.fire('เกิดข้อผิดพลาด', 'กรุณาเลือกวิธีการชำระเงิน.', 'error');
      return;
    }
  
    // สร้างรายการสั่งซื้อ
    const orderItems = this.cartItems.map(item => ({
      productId: item.productId,
      orderQuantity: item.cartQuantity,
      totalPrice: item.price * item.cartQuantity,
    }));
  
    // อัพเดทค่าในฟอร์ม paymentForm กับ QR Code URL
    this.qrCodeUrl = this.generateQRCodeUrl(); // สร้าง QR Code URL จาก getTotalAmount()
  
    const orderDetails = {
      userId: parseInt(userId, 10),
      addressId: this.selectedAddress.id,
      totalAmount: this.getTotalAmount(),
      status: 'รอดำเนินการ',
      orderItems: orderItems,
      payment: {
        paymentMethodId: this.selectedPaymentMethod.id,
        amount: this.getTotalAmount(), // ใช้ getTotalAmount() ที่คำนวณไว้
        approveBy: this.selectedPaymentMethod.id === 2 ? '' : this.paymentForm.value.approveBy,
        paymentStatus: this.selectedPaymentMethod.id === 2 ? 'ยังไม่ชำระ' : 'ชำระแล้ว',
        paymentImgName: this.selectedPaymentMethod.id === 2 ? 'ชำระปลายทาง' : this.paymentForm.value.paymentImgName,
        paymentImgPath: this.selectedPaymentMethod.id === 2 ? 'ชำระปลายทาง' : this.paymentForm.value.paymentImgPath,
      }
    };
  
    // นำ orderDetails เข้ารายการ FormData ในรูปแบบ JSON
    formData.append('orderDetails', JSON.stringify(orderDetails));
  
    // ตรวจสอบว่า paymentMethodId เป็น 2 หรือไม่ ถ้าไม่ใช่ให้เพิ่มไฟล์
    if (this.selectedPaymentMethod.id !== 2) {
      if (this.selectedFile) {
        formData.append('file', this.selectedFile, this.selectedFile.name);
      }
    }
  
    try {
      const orderResponse = await this.callService.saveOrder(formData).toPromise();
  
      const deletePromises = this.cartItems.map(item => this.callService.deleteCart(item.cartId).toPromise());
  
      Promise.all(deletePromises).then(() => {
        Swal.fire('สำเร็จ', 'คำสั่งซื้อของคุณได้รับการบันทึกแล้ว.', 'success').then(() => {
          this.router.navigate(['/']);
        });
      }).catch(error => {
        console.error('เกิดข้อผิดพลาดในการลบรายการในตะกร้า', error);
        Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถลบรายการในตะกร้าได้.', 'error');
      });
  
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการสั่งซื้อ', error);
      Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถสั่งซื้อได้. กรุณาลองอีกครั้ง.', 'error');
    }
  }
  
  

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      console.log('Selected file:', this.selectedFile);
    }
  }
}
