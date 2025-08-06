import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UserType } from './user.type';
import { CreateUserInput } from './create-user.input';

@Resolver(() => UserType)
export class UserResolver {
  private users: UserType[] = [
    { id: 1, name: 'Alice', email: 'alice@example.com' },
    { id: 2, name: 'Bob', email: 'bob@example.com' },
  ];

  @Query(() => [UserType], { name: 'users' })
  getUsers(): UserType[] {
    return this.users;
  }

  @Query(() => UserType, { name: 'user', nullable: true })
  getUser(@Args('id') id: number): UserType | undefined {
    return this.users.find((user) => user.id === id);
  }

  @Mutation(() => UserType)
  createUser(@Args('input') input: CreateUserInput): UserType {
    const newUser: UserType = {
      id: this.users.length + 1,
      name: input.name,
      email: input.email,
    };
    this.users.push(newUser);
    return newUser;
  }
}
