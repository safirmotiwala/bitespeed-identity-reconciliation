import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // Assuming you have a PrismaService that encapsulates the Prisma client operations
import { IdentifyRequestDto, ContactDto } from './contact.dto';
import { Contact } from '@prisma/client';

@Injectable()
export class ContactService {
  constructor(private readonly prisma: PrismaService) {}

  async reconcile(data: IdentifyRequestDto): Promise<ContactDto> {
    let contacts: Contact[] = [];

    if (data.email) {
      const emailContacts = await this.prisma.contact.findMany({
        where: { email: data.email },
      });
      contacts = [...contacts, ...emailContacts];
    }
    if (data.phoneNumber) {
      const phoneNumberContacts = await this.prisma.contact.findMany({
        where: { phoneNumber: data.phoneNumber },
      });
      contacts = [...contacts, ...phoneNumberContacts];
    }
    if (!contacts.length) {
      // If no contacts are found, create a new primary contact
      const newContact = await this.prisma.contact.create({
        data: {
          email: data.email,
          phoneNumber: data.phoneNumber,
          linkPrecedence: 'primary',
        },
      });
      return this.constructContactDto([newContact]);
    } else {
      contacts.sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1));

      // Find the primary contact
      const primaryContact = contacts[0];

      if (contacts.every((contact) => contact.linkPrecedence === 'primary')) {
        // If all contacts are the primary contact, keep the first one and update the rest
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

      // If the incoming contact is not linked, create a secondary contact linked to the primary contact
      else if (
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

      const filters = [
        { linkedId: primaryContact.id },
        primaryContact.linkedId && { id: primaryContact.linkedId },
      ];

      // Fetch all contacts linked to the primary contact
      const allLinkedContacts = await this.prisma.contact.findMany({
        where: {
          OR: filters.filter(Boolean),
        },
      });

      return this.constructContactDto([primaryContact, ...allLinkedContacts]);
    }
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
