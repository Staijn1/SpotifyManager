import { MessageService } from './message.service';
import { Message } from '../../types/Message';

describe('MessageService', () => {
  let service: MessageService;

  beforeEach(() => {
    service = new MessageService();
  });

  it('should add Error object to messages', () => {
    const error = new Error('Test error');
    service.setMessage(error);
    
    const messages = service.getMessages();


    expect(messages).toHaveLength(1);
    expect(messages[0]).toEqual(expect.objectContaining(new Message('error','Test error' )));
  });

  it('should add Message object to messages', () => {
    const message = new Message('info', 'Test message');
    service.setMessage(message);
    const messages = service.getMessages();
    expect(messages).toHaveLength(1);
    expect(messages[0]).toEqual(message);
  });

  it('should get all messages', () => {
    const error = new Error('Test error');
    const message = new Message('info', 'Test message');

    service.setMessage(error);
    service.setMessage(message);
    const messages = service.getMessages();

    const expectedMessages = JSON.stringify([new Message('error', 'Test error'), message]);
    expect(messages).toHaveLength(2);
    expect(JSON.stringify(messages)).toEqual(expectedMessages);
  });
});
