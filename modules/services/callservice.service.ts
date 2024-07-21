import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, concat } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AnyCatcher } from 'rxjs/internal/AnyCatcher';

const API_ENDPOINT = environment.API_ENDPOINT;
const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json', 'accept': '*/*' }) };
const httpOptionsText = { headers: new HttpHeaders({ 'Content-Type': 'text/plain; charset=utf-8' }) };
const httpOptionsMultipart = { headers: new HttpHeaders({ 'Content-Type': 'multipart/form-data', 'accept': '*/*' }) };

@Injectable({
  providedIn: 'root'
})
export class CallserviceService {

  constructor(private http: HttpClient

  ) { }

  saveRegister(formData: FormData): Observable<any> {
    return this.http.post<any>(API_ENDPOINT.concat('/register/save'), formData);
  }

  authen(userName:any, password:any) : Observable<any> {

    return this.http.get(API_ENDPOINT.concat('/login/authen?userName=' + userName + '&password='+ password))
  }

  getAllUser() : Observable<any> {
    return this.http.get(API_ENDPOINT.concat('/user/getAllUser'));
  }
  

  deleteUserByUserId(userId : any) : Observable<any> {
    return this.http.delete(API_ENDPOINT.concat('/user/delete?userId='+ userId));
  }

  upDateUserData(data: FormData, userId: any): Observable<any> {
    return this.http.put<any>(API_ENDPOINT.concat('/user/update/' + userId), data);
  }

  getByUserId(userId:any) : Observable<any> {
    return this.http.get(API_ENDPOINT.concat('/user/getById?userId=' + userId))
  }
  getProductImgByProductId(productId:any) : Observable<any> {
    return this.http.get(API_ENDPOINT.concat('/product/getProductImgByProductId?productId=' + productId))
  }

  getBlobThumbnail(fileName: string): Observable<Blob> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'    
    });
    return this.http.get<Blob>(API_ENDPOINT.concat('/product/getImageByte?fileName='+fileName)
    , {headers: headers, responseType: 'blob' as 'json' });
  }

  getImageByte(fileName: string): Observable<Blob> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'    
    });
    return this.http.get<Blob>(API_ENDPOINT.concat('/product/getImageByte?fileName='+fileName)
    , {headers: headers, responseType: 'blob' as 'json' });
  }

  getAllProduct() : Observable<any> {
    return this.http.get(API_ENDPOINT.concat('/product/getAll'));
  }

  getProductTypeAll() : Observable<any> {
    return this.http.get(API_ENDPOINT.concat('/product/getProductTypeAll'));
  }

  saveImage(formData: FormData, productId : any) : Observable<any> {
    return this.http.post<any>(API_ENDPOINT.concat('/product/saveImage/' + productId), formData)
  }

  saveProduct(data : any) : Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post<any>(API_ENDPOINT.concat('/product/save'), body, httpOptions)
  }

  removeImgByProductId(productId : any) : Observable<any> {
    return this.http.delete(API_ENDPOINT.concat('/product/removeImgByProductId?productId='+ productId));
  }

  deleteProduct(productId : any) : Observable<any> {
    return this.http.delete(API_ENDPOINT.concat('/product/delete?productId='+ productId));
  }

  getProductByProductId(productId:any) : Observable<any> {
    return this.http.get(API_ENDPOINT.concat('/product/getById?productId=' + productId))
  }

  updateProduct(data : any, productId : any) : Observable<any> {
    const body = JSON.stringify(data);
    return this.http.put<any>(API_ENDPOINT.concat('/product/update/'+ productId), body, httpOptions)
  }

  deleteImage(fileName : any) : Observable<any> {
    return this.http.delete(API_ENDPOINT.concat('/product/deleteImgByFileName?fileName='+ fileName));
  }

  getAllAddress() : Observable<any> {
    return this.http.get(API_ENDPOINT.concat('/address/getAll'));
  }

  saveAddress(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post<any>(API_ENDPOINT.concat('/address/save'),body, httpOptions);
  }
  

  deleteByAddress(userId: any): Observable<any> {
    return this.http.delete(API_ENDPOINT + '/address/deleteByUserId?userId=' + userId);
  }
  

  upDateAddressData(data: any, userId: number): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.put<any>(API_ENDPOINT.concat('/address/user/update/' + userId), body, httpOptions);
  }

  getByAddressId(addressId:any) : Observable<any> {
    return this.http.get(API_ENDPOINT.concat('/address/getById?addressId=' +addressId))
  }

  getByAddressUserId(userId: any): Observable<any> {
    return this.http.get(API_ENDPOINT.concat('/address/user?userId=' + userId));
  }

  getCartByUserId(userId:any ) : Observable<any> {
    return this.http.get(API_ENDPOINT.concat('/cart/getAllCartByUserId?userId=' + userId))
  }

  saveCart(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post<any>(API_ENDPOINT.concat('/cart/save'), body, httpOptions);
  }

  deleteCart(cartId: any): Observable<any> {
    return this.http.delete(API_ENDPOINT + '/cart/delete?id=' + cartId);
  }

  deleteCartUserId(userId: any): Observable<any> {
    return this.http.delete(API_ENDPOINT + '/cart/user/delete?userId=' + userId);
  }


  getOrdersByUserId(userId:any ) : Observable<any> {
    return this.http.get(API_ENDPOINT.concat('/order/getByUserId?userId=' + userId))
  }

  saveOrder(orderData: FormData): Observable<any> {
    return this.http.post<any>(API_ENDPOINT.concat('/order/save'), orderData);
  }

  getAllOrder() : Observable<any> {
    return this.http.get(API_ENDPOINT.concat('/order/getAll'));
  }

  getOrderbyId(orderId : any) : Observable<any> {
    return this.http.get(API_ENDPOINT.concat('/order/getById?id='+orderId));
  }

  getAllOrderItem() : Observable<any> {
    return this.http.get(API_ENDPOINT.concat('/orderItem/getAll'));
  }

  getByOrderItemId(orderItemId: any) : Observable<any> {
    return this.http.get(API_ENDPOINT.concat('/orderItem/getById?id=' + orderItemId));
  }

  getAllOrderItemsByOrderId(orderId: any) : Observable<any> {
    return this.http.get(API_ENDPOINT.concat('/orderItem/getByOrderId?orderId=' + orderId));
  }


  getAllPaymentMethod() : Observable<any> {
    return this.http.get(API_ENDPOINT.concat('/paymentMethod/getAll'));
  }

  getAllPayment() : Observable<any> {
    return this.http.get(API_ENDPOINT.concat('/payment/getAll'));
  }

  getPaymentById(paymentId: any) : Observable<any> {
    return this.http.get(API_ENDPOINT.concat('/payment/getAllById?id='+paymentId));
  } 

  updateOrder(data: any ,orderId : number) : Observable<any> {
    const body = JSON.stringify(data);
    return this.http.put<any>(API_ENDPOINT.concat('/order/update/'+ orderId), body,httpOptions);
  } 



}











