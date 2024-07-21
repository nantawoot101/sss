import { Component, OnInit } from '@angular/core';
import { CallserviceService } from '../services/callservice.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-manage-order',
  templateUrl: './manage-order.component.html',
  styleUrls: ['./manage-order.component.css']
})
export class ManageOrderComponent implements OnInit {

  orderList: any[] = [];
  filteredOrderList: any[] = [];
  paymentList: any[] = [];
  userList: any[] = [];
  paymentMethodList: any;
  selectedStatus: string = 'ทั้งหมด'; 
  originalStatus: string;

  constructor(
    private callService: CallserviceService,
    private router: Router
  ) { }

  ngOnInit() {
    this.getOrdersAndPayments();
    this.getPaymentMethod();
  }

  getOrdersAndPayments() {
    this.callService.getAllOrder().subscribe(orderRes => {
      if (orderRes.data) {
        this.orderList = orderRes.data;
        this.callService.getAllPayment().subscribe(paymentRes => {
          if (paymentRes.data) {
            this.paymentList = paymentRes.data;
            this.orderList.forEach(order => {
              const payment = this.paymentList.find(p => p.orderId === order.id);
              order.paymentStatus = payment ? payment.paymentStatus : 'ไม่พบสถานะการชำระเงิน';
            });
          }
        });
      }
    });
  }

  getAllUser(){
    this.callService.getAllUser().subscribe(res => {
      if (res.data) {
        this.userList = res.data;
      }
    });
  }


  getUser(userId: number): string {
    const user = this.userList.find((type: any) => type.userId === userId);
    return user ? user.userName : 'ไม่มีข้อมูล';
  }


  filterOrders() {
    if (this.selectedStatus === 'ทั้งหมด') {
      this.filteredOrderList = this.orderList;
    } else {
      this.filteredOrderList = this.orderList.filter(order => order.status === this.selectedStatus);
    }
  }

  formatDate(timestamp: number): string {
    if (timestamp < 1000000000000) {
      timestamp *= 1000;
    }
    const date = new Date(timestamp);
    return date.toLocaleString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    });
  }

  onOrderItem(id: number) {
    this.router.navigate(['/orderDetail/' + id]);
  }

  getPaymentMethod() {
    this.callService.getAllPaymentMethod().subscribe((res) => {
      if (res.data) {
        this.paymentMethodList = res.data;
      }
    });
  }

  onStatusChange(orderId: number, newStatus: string) {
    this.originalStatus = this.orderList.find(order => order.id === orderId).status;
    Swal.fire({
      title: 'คุณแน่ใจหรือไม่?',
      text: `คุณต้องการเปลี่ยนสถานะคำสั่งซื้อเป็น "${newStatus}" หรือไม่?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ใช่, เปลี่ยนสถานะ!',
      cancelButtonText: 'ไม่, ยกเลิก!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.updateOrderStatus(orderId, newStatus);
      } else {
        this.resetStatus(orderId);
      }
    });
  }

  resetStatus(orderId: number) {
    const order = this.orderList.find(order => order.id === orderId);
    order.status = this.originalStatus;
  }
  
  updateOrderStatus(orderId: number, status: string) {
    const order = this.orderList.find(order => order.id === orderId);
    order.status = status;
  
    const data = {
      status: status,
    };
  
    console.log('Sending data to backend:', data); 
  
    this.callService.updateOrder(data, orderId).subscribe(response => {
      if (response.status === 'Success') {
        Swal.fire({
          title: 'สำเร็จ!',
          text: 'สถานะคำสั่งซื้อถูกเปลี่ยนแล้ว.',
          icon: 'success',
          confirmButtonText: 'ตกลง'
        });
        this.filterOrders(); // Re-filter orders after status update
      } else {
        Swal.fire({
          title: 'เกิดข้อผิดพลาด!',
          text: 'ไม่สามารถเปลี่ยนสถานะคำสั่งซื้อได้.',
          icon: 'error',
          confirmButtonText: 'ตกลง'
        });
      }
    });
  }
  
  onFilterStatus(status: string) {
    this.selectedStatus = status;
    this.filterOrders();
  }
}
