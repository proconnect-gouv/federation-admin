import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ObjectIdColumn,
  Index,
} from 'typeorm';

@Entity('account')
export class Citizen {
  @ObjectIdColumn()
  // Native MongoDB column name
  // tslint:disable-next-line: variable-name
  _id?: string;

  @Column()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index({ unique: true })
  identityHash: string;

  @Column()
  // App does not need to handle federationKey for the moment,
  // so let's just type it as "any"
  federationKeys: any[];

  @Column()
  // App does not need to handle servicesProvidersFederationKeys for the moment,
  // so let's just type it as "any"
  servicesProvidersFederationKeys: any[];

  @Column()
  active: boolean;

  @Column()
  noDisplayConfirmation: boolean;

  @Column({ name: 'createdAt' })
  @Index({ unique: true })
  createdAt: Date;

  @Column({ name: 'updatedAt' })
  updatedAt?: Date;

  @Column({ name: 'lastConnection' })
  lastConnection?: Date;

  @Column({ name: 'preferences' })
  preferences?: {
    idpSettings?: {
      updatedAt: Date;
      isExcludeList: boolean;
      list: string[];
    };
  };
}
