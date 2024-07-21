import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { CallserviceService } from '../services/callservice.service';

@Component({
  selector: 'app-orderItem',
  templateUrl: './orderItem.component.html',
  styleUrls: ['./orderItem.component.css']
})
export class OrderItemComponent implements OnInit {
  orderId: number | undefined;
  orderDetails: any = {};
  paymentDetails: any = {};
  orderItems: any[] = [];
  userDetails: any = {};
  productsDetails: any = [];

  constructor(
    private route: ActivatedRoute, 
    private callService: CallserviceService
  ) {}

  ngOnInit(): void {
    const userDetailSession = sessionStorage.getItem("userDetail");
    if (userDetailSession) {
      this.userDetails = JSON.parse(userDetailSession);
      this.loadOrderItems(this.userDetails.id); // ดึง userId จาก userDetails แล้วเรียกฟังก์ชัน loadOrderItems
    }
  }

  loadOrderItems(userId: number): void {
    this.callService.getAllOrderItemsByOrderId(userId).subscribe(
      (data: any) => {
        this.orderItems = data;
      },
      (error: any) => {
        console.error('Error fetching order items', error);
      }
    );
  }
}
