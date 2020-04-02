import UserAggregate from '../example/aggregate';
import EventStore from '../example/eventstore';
import EventBusAdapater from '../example/eventbusadapter';
import CreateAccountCommand from '../example/commands/CreateAccountCommand';
import CloseAccountCommand from '../example/commands/CloseAccountCommand';

test('Aggregate', async () => {
  const eventAdapter = EventBusAdapater.getInstance();
  const eventStore = new EventStore();
  const userAggregate = UserAggregate.createNewInstance(eventStore, eventAdapter);

  const createAccountCommand = new CreateAccountCommand({});

  userAggregate.handle(createAccountCommand);

  expect(userAggregate.reduce(eventStore.getEvents()).status).toBe('created');
  expect(userAggregate.reduce(eventStore.getEvents()).version).toBe(0);

  await new Promise((r) => setTimeout(r, 100));

  const currentUserAggregate = UserAggregate.getInstance(userAggregate.id!, eventStore, eventAdapter);

  const closeAccountCommand = new CloseAccountCommand({ status: 'closed' });
  currentUserAggregate.handle(closeAccountCommand);

  expect(userAggregate.reduce(eventStore.getEvents()).status).toBe('closed');
  expect(userAggregate.reduce(eventStore.getEvents()).version).toBe(1);
});