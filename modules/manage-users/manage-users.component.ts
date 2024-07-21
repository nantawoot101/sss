import { Component, OnInit } from '@angular/core';
import { CallserviceService } from '../services/callservice.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { environment } from 'src/environments/environment';
const API_ENDPOINT = environment.API_ENDPOINT;

@Component({
  selector: 'app-manage-users',
  templateUrl: './manage-users.component.html',
  styleUrls: ['./manage-users.component.css']
})
export class ManageUsersComponent implements OnInit {

  constructor(
    private callService: CallserviceService,
    private router: Router
  ) { }

  userList: any;
  filteredUserList: any;
  searchTerm: string = '';
  imgBaseUrl = environment.API_ENDPOINT + '/upload/input/profile/';

  ngOnInit() {
    this.callService.getAllUser().subscribe(res => {
      if (res.data) {
        this.userList = res.data;
        this.filteredUserList = res.data;
      }
    })
  }

  onUpdateUser(userId: any) {
    if (userId) {
      this.router.navigate(['/profile/' + userId]);
    }
  }

  onDeleteUser(userId: any) {
    if (userId) {
      Swal.fire({
        title: 'คุณแน่ใจหรือไม่?',
        text: "คุณจะไม่สามารถกู้คืนข้อมูลนี้ได้!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'ใช่, ลบมัน!',
        cancelButtonText: 'ยกเลิก'
      }).then((result) => {
        if (result.isConfirmed) {
          this.callService.deleteUserByUserId(userId).subscribe(res => {
            if (res.data) {
              Swal.fire(
                'ลบแล้ว!',
                'ข้อมูลของคุณถูกลบแล้ว.',
                'success'
              ).then(() => {
                this.filteredUserList = this.filteredUserList.filter((user: any) => user.userId !== userId);
              });
            } else {
              Swal.fire(
                'เกิดข้อผิดพลาด!',
                'ไม่สามารถลบข้อมูลได้ กรุณาลองใหม่อีกครั้ง.',
                'error'
              );
            }
          });
        }
      });
    }
  }

  onSearch() {
    this.filteredUserList = this.userList.filter((user: any) => {
      return user.firstName.toLowerCase().includes(this.searchTerm.toLowerCase()) || 
             user.lastName.toLowerCase().includes(this.searchTerm.toLowerCase());
    });
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
    });
  }
}
