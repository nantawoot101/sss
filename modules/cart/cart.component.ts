import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CallserviceService } from '../services/callservice.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  cartItems: {
    userId: string,
    productId: string,
    productName: string,
    productDesc: string,
    price: number,
    author: string,
    pubLisher: string,
    cartQuantity: number,
    productImgName: string,
    productImage: string,
    cartId: any // เพิ่ม cartId ในรายการสินค้า
  }[] = [];
  selectedItems: any[] = [];
  allSelected: boolean = false;

  constructor(
    private callService: CallserviceService,
    private domSanitizer: DomSanitizer,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadCartItems();
  }

  loadCartItems() {
    const userId = sessionStorage.getItem('userId');
    if (userId) {
      this.callService.getCartByUserId(userId).subscribe(
        res => {
          if (res.data) {
            this.cartItems = res.data.map((item: any) => ({
              userId: item.userId,
              productId: item.productId,
              productName: item.productName,
              productDesc: item.productDesc,
              price: item.price,
              author: item.author,
              pubLisher: item.pubLisher,
              cartQuantity: item.cartQuantity,
              productImgName: item.productImgName,
              productImage: sessionStorage.getItem(item.productId),
              cartId: item.cartId // ต้องแน่ใจว่า item มี cartId ที่ถูกส่งมาจาก API
            }));
            // ตรวจสอบค่า cartItems หลังจากที่ได้รับข้อมูลเสร็จสมบูรณ์
            console.log('Cart Items:', this.cartItems);
          }
        },
        error => {
          console.error('เกิดข้อผิดพลาดในการดึงข้อมูลตะกร้าสินค้า', error);
        }
      );
    }
  }

  updateCartQuantity(cartId: any, change: number) {
    const item = this.cartItems.find(item => item.cartId === cartId);
    if (item) {
      item.cartQuantity += change;
      if (item.cartQuantity < 1) {
        item.cartQuantity = 1;
      }
      // Save the updated quantity to the server or sessionStorage if necessary
    }
  }

  onDeleteCart(cartId: any) {
    if (cartId) {
      // ดึงข้อมูลรูปภาพที่ต้องการลบออกจาก sessionStorage
      const item = this.cartItems.find(item => item.cartId === cartId);
      if (item) {
        const productId = item.productId;
        sessionStorage.removeItem(productId); // ลบรูปภาพที่เกี่ยวข้องออกจาก sessionStorage
      }

      // เรียก API service เพื่อลบรายการในตะกร้า
      this.callService.deleteCart(cartId).subscribe(
        res => {
          if (res) {
            // ลบรายการในตะกร้าแล้วให้โหลดข้อมูลใหม่
            window.location.reload();
          }
        },
        error => {
          console.error('เกิดข้อผิดพลาดในการลบรายการในตะกร้า', error);
        }
      );
    }
  }

  toggleAllSelection() {
    this.allSelected = !this.allSelected;
    if (this.allSelected) {
      this.selectedItems = [...this.cartItems];
    } else {
      this.selectedItems = [];
    }
  }

  toggleSelection(item: any) {
    const index = this.selectedItems.findIndex(selected => selected.cartId === item.cartId);
    if (index >= 0) {
      this.selectedItems.splice(index, 1);
    } else {
      this.selectedItems.push(item);
    }
  }


  deleteSelectedItems() {
    this.selectedItems.forEach(item => {
      this.onDeleteCart(item.cartId);
    });
    this.selectedItems = [];
    this.allSelected = false;
  }

  onOrder() {
    // ส่ง selectedItems ไปยังหน้า Order พร้อมรูปภาพที่เกี่ยวข้อง
    this.router.navigate(['/order'], { state: { cartItems: this.selectedItems } });
  }
}
