$(function() {
  const contactTemplate = Handlebars.compile($('#contactTemplate').html());

  const contactList = {
    $contactForm: $('#create-contact'),
    $updateForm: $('#update'),
    $addContactButton: $('#add'),
    $toggleContactButton: $('#all-contacts'),
    $contactList: $('#contacts'),
    $searchBox: $('#search-input'),
    $searchTag: $('#tag-search'),
    $searchButton: $('#search-button'),

    getId(target) {
      return target.parentNode.getAttribute('data-id');
    },

    addContact(e) {
      e.preventDefault();
      this.$contactForm.slideToggle();
      
      let full_name = $('#name').val();
      let email = $('#email').val();
      let phone_number = $('#phone-number').val(); 
      let tags = $('#create-tag').val();
      
      $.ajax({
        url: 'http://localhost:3000/api/contacts',
        type: "POST",
        dataType: "json",
        data: { full_name, email, phone_number, tags }, 
      }).done(this.loadContacts());
      document.querySelector('#contact-form').reset();
    },

    editContact(e) {
      e.preventDefault();
      this.$updateForm.slideToggle();

      let id = this.$updateForm.attr("data-id");
      let full_name = $('#update-name').val();
      let email = $('#update-email').val();
      let phone_number = $('#update-phone-number').val(); 
      let tags = $('#update-tag').val();
      
      $.ajax({
        url: `http://localhost:3000/api/contacts/${id}`,
        type: "PUT",
        dataType: "json",
        data: { id, full_name, email, phone_number, tags }, 
      }).done(this.loadContacts());
    },

    deleteContact(target) {
      let id = this.getId(target);
      
      $.ajax({
        url: `http://localhost:3000/api/contacts/${id}`,
        type: "DELETE",
      }).done(this.loadContacts());
    },

    displayUpdateForm() {
      this.$contactForm.hide(); 
      this.$updateForm.slideToggle();
    },

    retreiveContact(id) {
      let xhr = new XMLHttpRequest();
        xhr.open('GET', `http://localhost:3000/api/contacts/${id}`);
        xhr.addEventListener('load', e => {
          contact = JSON.parse(xhr.response);
          $('#update-name').val(contact.full_name);
          $('#update-email').val(contact.email);
          $('#update-phone-number').val(contact.phone_number);
          $('#update-tag').val(contact.tags);
        });
        xhr.send();
    },

    handleClick(e) {
      if (e.target.textContent === 'Delete') {
        this.deleteContact(e.target);
      } else if (e.target.textContent === 'Edit') {
        let id = this.getId(e.target);
        this.$updateForm.attr("data-id", String(id));
        this.retreiveContact(id);
        this.displayUpdateForm();
      } 
    },

    loadContacts() {
      let xhr = new XMLHttpRequest();
      xhr.open('GET', 'http://localhost:3000/api/contacts');
      xhr.addEventListener('load', (e) => {
        let data = JSON.parse(xhr.response);
        let nameFilter = this.getSearchInfo()[0].toLowerCase();
        let regex = new RegExp(`^${nameFilter}`);
        let tagFilter = this.getSearchInfo()[1];
        if (nameFilter || tagFilter !== 'None') {
          data = data.filter(contact => contact.full_name.toLowerCase().match(regex));
          if (tagFilter !== 'None') {
            data = data.filter(contact => contact.tags === tagFilter);
          }
        }
        this.$contactList.html(contactTemplate({contacts: data}));
      });
      xhr.send();
    },

    displayContacts(e) {
      this.loadContacts();
      this.$contactForm.hide();
      this.$updateForm.hide();
      this.$contactList.slideToggle();
    },

    getSearchInfo() {
      let nameSearch = this.$searchBox.val().trim();
      let tagSearch = this.$searchTag.val();
      return [nameSearch, tagSearch];
    },

    bindEvents() {
      this.$contactForm.on('submit', this.addContact.bind(this));
      this.$updateForm.on('submit', this.editContact.bind(this));
      this.$addContactButton.on('click', (e) => {
        this.$updateForm.hide();
        this.$contactForm.slideToggle();
      });
      this.$searchButton.on('click', this.loadContacts.bind(this));
      this.$contactList.on('click', 'button', this.handleClick.bind(this)); 
      this.$toggleContactButton.on('click', this.displayContacts.bind(this));
    },

    init() {
      this.bindEvents();
    } 
  };

  contactList.init();

});