import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { CallserviceService } from '../services/callservice.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-orderItem',
  templateUrl: './orderItem.component.html',
  styleUrls: ['./orderItem.component.css']
})
export class OrderItemComponent implements OnInit {
  orderItems: any[] = [];
  productList: any = [];
  imageUrls: any = {};
  productImgList: any;

  constructor(
    private callService: CallserviceService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    const userId = sessionStorage.getItem('userId');
    if (userId) {
      this.loadOrderItems(userId);
      this.loadAllProducts();
    } else {
      console.error('User ID not found in sessionStorage');
    }
  }

  loadOrderItems(userId: string): void {
    this.callService.getOrdersByUserId(userId).subscribe(
      (response: any) => {
        if (response.status === 'Success') {
          console.log('Data fetched from API:', response.data);
          this.orderItems = response.data;
        } else {
          console.error('Failed to fetch order items', response.message);
        }
      },
      (error: any) => {
        console.error('Error fetching order items', error);
      }
    );
  }

  loadAllProducts(): void {
    this.callService.getAllProduct().subscribe(res => {
      if (res.data) {
        this.productList = res.data;
        for (let product of this.productList) {
          product.imgList = [];
          this.loadProductImages(product.productId, product.imgList);
        }
      }
    });
  }

  loadProductImages(productId: number, imgList: any[]): void {
    this.callService.getProductImgByProductId(productId).subscribe((res) => {
      if (res.data) {
        this.productImgList = res.data;
        for (let productImg of this.productImgList) {
          this.getImage(productImg.productImgName, imgList);
        }
      } else {
        console.error('Failed to fetch product images');
      }
    });
  }

  getImage(fileName: string, imgList: any[]): void {
    this.callService.getBlobThumbnail(fileName).subscribe((res: Blob) => {
      const objectURL = URL.createObjectURL(res);
      const safeUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL);
      imgList.push(safeUrl);
    });
  }

  getProductById(productId: number): any {
    return this.productList.find((product: any) => product.productId === productId);
  }

  cancelOrder(orderId: number): void {
    Swal.fire({
      title: 'ยืนยันการยกเลิก',
      text: 'คุณแน่ใจว่าต้องการยกเลิกคำสั่งซื้อนี้หรือไม่?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'ยืนยัน',
      cancelButtonText: 'ยกเลิก'
    }).then((result) => {
      if (result.isConfirmed) {
        const updatedData = { status: 'ยกเลิก' };
        this.callService.updateOrder(updatedData, orderId).subscribe(
          (response: any) => {
            if (response.status === 'Success') {
              Swal.fire(
                'ยกเลิกแล้ว!',
                'คำสั่งซื้อของคุณได้ถูกยกเลิกแล้ว',
                'success'
              );
              this.loadOrderItems(sessionStorage.getItem('userId')!); 
            } else {
              Swal.fire(
                'ข้อผิดพลาด',
                'ไม่สามารถยกเลิกคำสั่งซื้อได้',
                'error'
              );
              console.error('Failed to update order status', response.message);
            }
          },
          (error: any) => {
            Swal.fire(
              'ข้อผิดพลาด',
              'เกิดข้อผิดพลาดในการยกเลิกคำสั่งซื้อ',
              'error'
            );
            console.error('Error updating order status', error);
          }
        );
      }
    });
  }
  
}
