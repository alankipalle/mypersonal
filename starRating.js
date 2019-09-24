/* eslint-disable no-console */
import { LightningElement,track, api, wire } from 'lwc';
import { updateRecord, getRecord } from 'lightning/uiRecordApi';

const FIELDS = ['Contact.Rating__c'];

import {
    ShowToastEvent
    } from 'lightning/platformShowToastEvent';

export default class StarRating extends LightningElement {
    @track likeStateSize1 = false;
    @track likeStateSize2 = false;
    @track likeStateSize3 = false;
    @track likeStateSize4 = false;
    @track likeStateSize5 = false;
    @track rating;
    @api recordId;
    @track contact;
    @track isDisabled=false;

    @track currentRating =0;

    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
    wiredRecord({ error, data }) {
        if (error) {
            let message = 'Unknown error';
            if (Array.isArray(error.body)) {
                message = error.body.map(e => e.message).join(', ');
            } else if (typeof error.body.message === 'string') {
                message = error.body.message;
            }
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error loading contact',
                    message,
                    variant: 'error',
                }),
            );
        } else if (data) {
            this.contact = data;
            this.rating = this.contact.fields.Rating__c.value;
            console.log('Current Rating: '+this.rating);
           
            this.currentRating = parseInt(this.rating,10);

            this.populate(parseInt(this.rating,10),true);
            if(this.currentRating >0){
                this.isDisabled =true;
            }
        }
    }

    handleLikeButtonSizeClick(event) {
        event.preventDefault();
        if(this.currentRating >0){
            this.isDisabled =true;
            return;
        }
        const buttonNumber = event.target.dataset.buttonNumber;       
        console.log('buttonNumber '+buttonNumber);
        this.currentRating = parseInt(buttonNumber,10);
        this[`likeStateSize${buttonNumber}`] = !this[
            `likeStateSize${buttonNumber}`
        ];
        const status = this[`likeStateSize${buttonNumber}`];
       
             // Update the contact with selcted rating  
            this.updateContact();
            // Read the current rating and update the stars       
            this.populate(buttonNumber,status);
        
        
        
       
    }

    populate(buttonNumber, status){
        console.log('contact Rating: '+buttonNumber);
        
        
        let buttonList  = this.template.querySelectorAll('lightning-button-icon-stateful');
       
        for(let i=0; i< buttonList.length; i++){
            let starNumber = buttonList[i].getAttribute('data-button-number');              

            if(parseInt(starNumber,10)<=parseInt(buttonNumber,10) ){
               if(buttonList[i].selected === false) {
                   buttonList[i].selected = status;
               }
            }else if(parseInt(starNumber,10)>=parseInt(buttonNumber,10) && parseInt(starNumber,10)!==parseInt(buttonNumber,10)){
               if(buttonList[i].selected === true) {
                   buttonList[i].selected = false;
               }     
            }            
        } 
    }

    // Update the contact with selcted rating
    updateContact() {
        let record = {
            fields: {
                Id: this.recordId,
                Rating__c: this.currentRating
            },
        };
        updateRecord(record)
            // eslint-disable-next-line no-unused-vars
            .then(() => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Record Is Updated',
                        variant: 'sucess',
                    }),
                );
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error on data save',
                        message: error.message.body,
                        variant: 'error',
                    }),
                );
            });
    }
}