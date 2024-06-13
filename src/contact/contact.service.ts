import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // Assuming you have a PrismaService that encapsulates the Prisma client operations
import { IdentifyRequestDto, ContactDto } from './dtos/contact.dtos';
import { Contact } from '@prisma/client';

@Injectable()
export class ContactService {
  constructor(private readonly prisma: PrismaService) {}

  async reconcile(data: IdentifyRequestDto): Promise<ContactDto> {
    const filters = [];
    if (data.email) {
      filters.push({ email: data.email });
    }
    if (data.phoneNumber) {
      filters.push({ phoneNumber: data.phoneNumber });
    }

    const contacts = await this.prisma.contact.findMany({
      where: { OR: filters },
    });

    if (!contacts.length) {
      const newContact = await this.prisma.contact.create({
        data: {
          email: data.email,
          phoneNumber: data.phoneNumber,
          linkPrecedence: 'primary',
        },
      });
      return this.constructContactDto([newContact]);
    }

    contacts.sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1));
    const primaryContact = contacts[0];

    if (contacts.every((contact) => contact.linkPrecedence === 'primary')) {
      const [firstContact, ...restContacts] = contacts;
      await this.prisma.contact.updateMany({
        where: {
          id: {
            in: restContacts.map((contact) => contact.id),
          },
        },
        data: {
          linkedId: firstContact.id,
          linkPrecedence: 'secondary',
        },
      });
      return this.constructContactDto([
        firstContact,
        ...(restContacts.map((contact) => ({
          ...contact,
          linkedId: firstContact.id,
          linkPrecedence: 'secondary',
        })) as Contact[]),
      ]);
    }

    if (
      contacts.some(
        (contact) =>
          contact.email === data.email ||
          contact.phoneNumber === data.phoneNumber,
      )
    ) {
      await this.prisma.contact.create({
        data: {
          email: data.email,
          phoneNumber: data.phoneNumber,
          linkPrecedence: 'secondary',
          linkedId: primaryContact.id,
        },
      });
    }

    const allLinkedContacts = await this.prisma.contact.findMany({
      where: {
        OR: [
          { linkedId: primaryContact.id },
          primaryContact.linkedId && { id: primaryContact.linkedId },
        ].filter(Boolean),
      },
    });

    return this.constructContactDto([primaryContact, ...allLinkedContacts]);
  }

  private constructContactDto(contacts: Array<Contact>): ContactDto {
    const primaryContact =
      contacts.find((contact) => contact.linkPrecedence === 'primary') ||
      contacts[0];
    return {
      primaryContactId: primaryContact.id,
      emails: [
        ...new Set(contacts.map((contact) => contact.email).filter(Boolean)),
      ],
      phoneNumbers: [
        ...new Set(
          contacts.map((contact) => contact.phoneNumber).filter(Boolean),
        ),
      ],
      secondaryContactIds: contacts
        .filter((contact) => contact.linkPrecedence === 'secondary')
        .map((contact) => contact.id),
    };
  }
}
