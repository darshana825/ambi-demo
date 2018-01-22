import Socket from './Socket'
import AjaxProvider from './AjaxProvider'

class ContactProvider extends AjaxProvider {
  constructor() {
    super()
    this.authToken = null
    this.socket = Socket.socket
  }

  getContacts() {
    return this.get('/contacts/all', true)
  }

  getGroupMembers(groupID) {
    return this.post('/contact/group-members', true, {groupID: groupID})
  }

  updateUserMode(userMode) {
    return this.post('/me/update/user-mode', true, {userMode: userMode})
  }

  changeUserMode(contacts, modeChangedUsername, mode) {
    this.socket.emit('contacts update-user-mode', contacts, modeChangedUsername, mode)
  }

  onContactChangeMode(callback) {
    return this.socket.on('contact-mode-changed', function (contact) {
      callback(contact);
    });
  }

  createContactName(firstName, lastName) {
    return firstName.charAt(0).toUpperCase() + firstName.slice(1) + ' ' + lastName.charAt(0).toUpperCase() + lastName.slice(1)
  }
}

export default new ContactProvider
