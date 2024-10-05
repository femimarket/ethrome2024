import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { BrowserModule } from '@angular/platform-browser';
import { MaterialModule } from '../material.module';
import { CommonModule } from '@angular/common';

interface ChartData {
  name: string;
  price: number;
}

interface OrderBookData {
  price: number;
  amount: number;
}

interface CurrentPrice {
  price: number;
  change: number;
}

interface TradingHistoryData {
  time: string;
  price: number;
  amount: number;
  type: 'buy' | 'sell';
}

@Component({
  standalone: true,
  selector: 'app-trade',
  imports: [ReactiveFormsModule,MaterialModule,FormsModule,CommonModule],
  templateUrl: './trade.component.html',
  styleUrls: ['./trade.component.scss']
})
export class TradeComponent implements OnInit {
  selectedPair = 'BTC/USD';
  orderType = 'market';
  side = 'buy';
  orderForm: FormGroup;

  chartData: { [key: string]: ChartData[] } = {
    'BTC/USD': [
      { name: '00:00', price: 33000 },
      { name: '04:00', price: 34200 },
      { name: '08:00', price: 33800 },
      { name: '12:00', price: 34500 },
      { name: '16:00', price: 34100 },
      { name: '20:00', price: 34800 },
      { name: '24:00', price: 35000 },
    ],
    'ETH/USD': [
      { name: '00:00', price: 2200 },
      { name: '04:00', price: 2250 },
      { name: '08:00', price: 2180 },
      { name: '12:00', price: 2300 },
      { name: '16:00', price: 2280 },
      { name: '20:00', price: 2350 },
      { name: '24:00', price: 2400 },
    ],
    'XRP/USD': [
      { name: '00:00', price: 0.50 },
      { name: '04:00', price: 0.52 },
      { name: '08:00', price: 0.51 },
      { name: '12:00', price: 0.53 },
      { name: '16:00', price: 0.52 },
      { name: '20:00', price: 0.54 },
      { name: '24:00', price: 0.55 },
    ],
  };

  orderBookData: { [key: string]: { asks: OrderBookData[], bids: OrderBookData[] } } = {
    'BTC/USD': {
      asks: [
        { price: 34850, amount: 1.2 },
        { price: 34900, amount: 0.8 },
        { price: 34950, amount: 2.5 },
      ],
      bids: [
        { price: 34800, amount: 1.5 },
        { price: 34750, amount: 2.0 },
        { price: 34700, amount: 1.8 },
      ],
    },
    'ETH/USD': {
      asks: [
        { price: 2320, amount: 5.5 },
        { price: 2325, amount: 3.2 },
        { price: 2330, amount: 7.8 },
      ],
      bids: [
        { price: 2315, amount: 4.7 },
        { price: 2310, amount: 6.1 },
        { price: 2305, amount: 5.3 },
      ],
    },
    'XRP/USD': {
      asks: [
        { price: 0.535, amount: 10000 },
        { price: 0.536, amount: 8500 },
        { price: 0.537, amount: 12000 },
      ],
      bids: [
        { price: 0.534, amount: 9500 },
        { price: 0.533, amount: 11000 },
        { price: 0.532, amount: 9000 },
      ],
    },
  };

  currentPrices: { [key: string]: CurrentPrice } = {
    'BTC/USD': { price: 34825.00, change: 2.5 },
    'ETH/USD': { price: 2318.75, change: 1.8 },
    'XRP/USD': { price: 0.5345, change: -0.5 },
  };

  tradingHistoryData: { [key: string]: TradingHistoryData[] } = {
    'BTC/USD': [
      { time: '14:30:15', price: 34825.00, amount: 0.5, type: 'buy' },
      { time: '14:29:58', price: 34820.50, amount: 0.3, type: 'sell' },
      { time: '14:29:30', price: 34822.75, amount: 0.7, type: 'buy' },
      { time: '14:28:45', price: 34818.25, amount: 0.2, type: 'sell' },
      { time: '14:28:15', price: 34819.50, amount: 0.4, type: 'buy' },
    ],
    'ETH/USD': [
      { time: '14:30:10', price: 2318.75, amount: 2.5, type: 'buy' },
      { time: '14:29:55', price: 2318.50, amount: 1.8, type: 'sell' },
      { time: '14:29:25', price: 2319.00, amount: 3.2, type: 'buy' },
      { time: '14:28:50', price: 2317.75, amount: 1.5, type: 'sell' },
      { time: '14:28:20', price: 2318.25, amount: 2.0, type: 'buy' },
    ],
    'XRP/USD': [
      { time: '14:30:05', price: 0.5345, amount: 5000, type: 'sell' },
      { time: '14:29:50', price: 0.5344, amount: 7500, type: 'buy' },
      { time: '14:29:20', price: 0.5346, amount: 6000, type: 'sell' },
      { time: '14:28:55', price: 0.5343, amount: 8000, type: 'buy' },
      { time: '14:28:25', price: 0.5345, amount: 5500, type: 'sell' },
    ],
  };

  constructor(private fb: FormBuilder) {
    this.orderForm = this.fb.group({
      amount: [''],
      price: [''],
    });
  }

  ngOnInit() {
    // Any initialization logic can go here
  }

  onPairChange(newPair: string) {
    this.selectedPair = newPair;
  }

  onOrderTypeChange(newType: string) {
    this.orderType = newType;
  }

  onSideChange(newSide: string) {
    this.side = newSide;
  }

  placeOrder() {
    console.log('Order placed:', {
      pair: this.selectedPair,
      type: this.orderType,
      side: this.side,
      amount: this.orderForm.get('amount')?.value,
      price: this.orderForm.get('price')?.value,
    });
    // Here you would typically send the order to your backend
  }
}