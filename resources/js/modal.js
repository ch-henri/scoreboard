class Dialog {
    constructor(triggerDialog) {
        this.triggerDialog = triggerDialog;
        this.dialog = document.querySelector('#dialog');
        this.closeBtn = dialog.querySelector('#closeDialogBtn');
        this.dialogInner = document.querySelector('#dialogInner');
        this.triggerDialog.addEventListener('click', this.showDialog);
    }

    showDialog = (event) => {
        this.dialog.showModal();
        event.stopPropagation();
        this.dialog.addEventListener('click', this.clickOutside);
        this.closeBtn.addEventListener('click', this.closeDialog);
    }

    clickOutside = (event) => {
        // console.log(event.target);
        if (!this.dialogInner.contains(event.target)) {
            this.closeDialog();
        }
    }
    closeDialog = () => {
        this.dialog.close();
        this.dialog.removeEventListener('click', this.clickOutside);
        this.closeBtn.removeEventListener('click', this.closeDialog);
    }
}
new Dialog(document.querySelector('#triggerDialog'))