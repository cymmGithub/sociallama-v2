import type { Metadata } from 'next'
import s from '@/app/(frontend)/[slug]/post.module.css'
import { Wrapper } from '@/components/layout/wrapper'
import { Link } from '@/components/ui/link'
import { alternatesForPath } from '@/lib/i18n/slug-map'

/*
 * English privacy policy — EN twin of `/polityka-prywatnosci`, a faithful
 * translation of the static Polish page. The WP original's restarting list
 * numbering is preserved; its osiedle-rozalin.pl reference in Article 7 was a
 * copy-paste error and has been corrected. Controller details follow the group
 * template (see the PL page). Keep the two pages in sync.
 */

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'Privacy policy and information on how the personal data of sociallama.pl users is protected.',
  alternates: alternatesForPath('/en/privacy-policy'),
}

export default function EnPrivacyPolicyPage() {
  return (
    <Wrapper theme="cream">
      <article className={s.article}>
        <header className={s.header}>
          <h1 className={s.title}>Privacy Policy</h1>
          <p className={s.lead}>
            Privacy policy and information on how the personal data of website
            users is protected.
          </p>
        </header>

        <div className={s.body}>
          <h2>Article 1. Controller</h2>
          <ol>
            <li>
              The controller of personal data is Good One sp. z o.o., with its
              registered office in Wrocław, ul. Januszowicka 5/121, 53-135
              Wrocław, NIP: 525-287-21-79; KRS: 0000914751; REGON: 389646858
            </li>
            <li>
              (hereinafter the “<strong>Controller</strong>”), who attaches
              great importance to protecting the privacy and confidentiality of
              the personal data of its Clients and other natural persons whose
              data the Controller processes (hereinafter “<strong>Users</strong>
              ”).
            </li>
            <li>
              The Controller can be contacted in writing at the Controller's
              registered address, by email at kontakt@goodone.co, or by
              completing the contact form available on the Controller's website.
            </li>
            <li>The Controller has not appointed a Data Protection Officer.</li>
          </ol>

          <h2>Article 2. Principles of processing personal data</h2>
          <ol>
            <li>
              The Controller processes personal data to the minimum extent
              necessary to achieve the processing purposes clearly defined in
              this Privacy Policy.
            </li>
            <li>
              The Controller carefully selects and applies appropriate technical
              and organizational measures to protect the personal data it
              processes. Full access to the databases is held only by persons
              duly authorized by the Controller.
            </li>
            <li>
              The Controller secures personal data against disclosure to
              unauthorized persons, as well as against processing in breach of
              applicable law. When processing personal data, the Controller
              applies solutions matched to the scale and nature of the
              processing, ensuring data subjects the highest degree of
              protection resulting from both the technological and
              organizational solutions used.
            </li>
            <li>
              The following personal data will be processed: first and last
              name, email address, phone number.
            </li>
          </ol>

          <h2>Article 3. Legal basis for processing personal data</h2>
          <ol>
            <li>
              The personal data provided by the User is processed in accordance
              with this Privacy Policy and applicable law, in particular
              Regulation (EU) 2016/679 of the European Parliament and of the
              Council of 27 April 2016 on the protection of natural persons with
              regard to the processing of personal data and on the free movement
              of such data, and repealing Directive 95/46/EC (the “GDPR”).
            </li>
            <li>
              Providing personal data is voluntary; however, failure to provide
              it will make it impossible to conclude and perform a contract,
              send an inquiry, or carry out the requested actions.
            </li>
            <li>The legal basis for processing personal data is:</li>
          </ol>
          <ul>
            <li>
              Art. 6(1)(a) GDPR – for personal data obtained on the basis of
              consent, on the terms set out in Art. 7 GDPR;
            </li>
            <li>
              Art. 6(1)(b) GDPR – for data provided voluntarily in order to
              respond to any inquiries or requests submitted, and to conduct
              further correspondence or contact before concluding a contract, as
              well as to prepare and perform a Contract between the User and the
              Controller or an entity the Controller commissions to perform the
              Contract.
            </li>
          </ul>
          <p>
            Providing data is voluntary but necessary to perform the Contract or
            to conduct correspondence with the Controller.
          </p>
          <ul>
            <li>
              Art. 6(1)(f) GDPR – for data processed in connection with the
              pursuit of the Controller's legitimate interests.
            </li>
          </ul>
          <ol>
            <li>
              The Controller may process third-party data made available by
              Users for the purpose of, or in connection with, the Controller's
              provision of services. When providing the Controller with
              third-party data, the User each time declares that they hold the
              appropriate consent of those third parties to transfer their data
              to the Controller.
            </li>
            <li>
              In the event of a change to the personal data referred to in this
              Privacy Policy, the User will inform the Controller without undue
              delay so that the personal data can be updated.
            </li>
            <li>
              The Controller does not apply profiling to Users within the
              meaning of Art. 4(4) GDPR.
            </li>
          </ol>

          <h2>Article 4. Data retention period</h2>
          <p>The User's data will be stored no longer than necessary, i.e.:</p>
          <ul>
            <li>
              for correspondence – personal data will be stored for the period
              necessary to handle the inquiry, i.e. the duration of the
              correspondence justified by the type of inquiry (but no longer
              than 6 months from the end of the correspondence).
            </li>
            <li>
              for performance of a contract – until the contract is completed,
              and thereafter for the period required by law or for the pursuit
              of any claims the Controller may raise or that may be raised
              against the Controller;
            </li>
            <li>
              for fulfilling a legal obligation incumbent on the Controller –
              until it is fulfilled;
            </li>
            <li>
              for the pursuit of legitimate interests by the Controller or a
              third party – until they are realized or until the User objects to
              the processing of personal data, unless there are legitimate
              grounds for further processing;
            </li>
            <li>
              for processing carried out solely on the basis of consent – until
              the data is promptly deleted following a request submitted by the
              User.
            </li>
          </ul>

          <h2>Article 5. User rights</h2>
          <ol>
            <li>
              In connection with the Controller's processing of personal data,
              the User has the right to:
            </li>
            <li>request access to personal data – Art. 15;</li>
          </ol>
          <p>
            At the User's request regarding access to their data, the Controller
            informs the User whether it processes their data and informs the
            User of the processing details in accordance with the GDPR, and also
            grants the User access to the data concerning them. Access to the
            data will be provided by sending a copy of the data electronically.
            Should a further copy of the data be requested in paper form, the
            Controller has the right to charge the User the costs of preparing
            it in that form and sending it, in accordance with Art. 15(3) GDPR.
          </p>
          <ol>
            <li>the right to rectify personal data – Art. 16 GDPR;</li>
          </ol>
          <p>The Controller rectifies incorrect data at the User's request.</p>
          <ol>
            <li>
              the right to request erasure of personal data – Art. 17 GDPR;
            </li>
          </ol>
          <p>
            This right applies insofar as erasure of the data does not conflict
            with regulations binding on the Controller,
          </p>
          <ol>
            <li>the right to restrict processing – Art. 18 GDPR;</li>
          </ol>
          <p>
            This right applies insofar as the Controller may restrict the
            processing of personal data in the context of the regulations
            binding on it and insofar as it does not infringe the Controller's
            right to pursue its claims against the User.
          </p>
          <ol>
            <li>data portability – Art. 20 GDPR;</li>
          </ol>
          <p>
            At the User's request, the Controller provides – in a structured,
            commonly used, machine-readable format – or transfers to another
            entity, where possible, the data concerning the User that they
            provided in order to conclude or perform a Contract, or that is
            processed on the basis of consent.
          </p>
          <ol>
            <li>to object to processing – Art. 21 GDPR;</li>
          </ol>
          <p>
            If the User raises an objection to the processing of their data
            justified by their particular situation, and the data is processed
            by the Controller on the basis of the Controller's legitimate
            interest, the Controller will uphold the objection unless it has
            compelling legitimate grounds for the processing that override the
            interests, rights, and freedoms of the person raising the objection,
            or grounds for the establishment, exercise, or defense of claims.
          </p>
          <ol>
            <li>
              to withdraw consent to the processing of data, without affecting
              the lawfulness of processing carried out on the basis of consent
              before its withdrawal – Art. 7(3) GDPR;
            </li>
            <li>
              to lodge a complaint with a supervisory authority – Art. 77 GDPR.
            </li>
            <li>
              If the Controller is unable to establish the content of the
              request or identify the person exercising the above rights based
              on the submitted request, it will ask the applicant for additional
              information.
            </li>
            <li>
              A response to requests will be provided within one month of
              receipt at the latest. Should it be necessary to extend this
              deadline, the Controller will inform the applicant of the reasons
              for the extension.
            </li>
          </ol>

          <h2>Article 6. Sharing personal data</h2>
          <ol>
            <li>
              Personal data will be shared only with authorized entities, i.e.
              authorized employees of the Controller and other persons acting
              under the Controller's authorization, as well as other entities
              authorized to receive the User's data on the basis of relevant
              legal provisions, and entities providing IT services to the
              Controller. Users' personal data may be transferred to other
              entities – in cases not indicated by the Controller or the law –
              only with the User's consent.
            </li>
            <li>
              The Controller undertakes not to transfer Users' personal data to
              third countries or international organizations.
            </li>
            <li>
              The Controller will oblige any entity to which it entrusts the
              User's personal data to implement appropriate safeguards for that
              data.
            </li>
          </ol>

          <h2>Article 7. Cookies</h2>
          <ol>
            <li>
              The website www.sociallama.pl (the “Website”) uses IT data stored
              on the end devices of Website users, i.e. in particular text files
              containing, among other things, the name of the website they come
              from, their storage time on the end device, and a unique number
              (“Cookies”).
            </li>
            <li>
              Pursuant to Art. 173(1) of the Telecommunications Law Act of 16
              July 2004 (Journal of Laws of 2021, item 576), the Controller
              hereby informs that:
            </li>
            <li>
              Cookies are used on the Website to make it easier to use, allow
              the content available on the Website to be tailored to users'
              individual needs and preferences, and serve to compile general
              statistics on the use of the Website.
            </li>
            <li>
              personal data collected using Cookies is gathered solely to
              perform certain functions for users and is encrypted in a way that
              prevents access by unauthorized persons.
            </li>
            <li>
              the Website user may consent to the use of Cookies by adjusting
              their web browser settings accordingly (in particular, enabling or
              blocking the use of “cookies”).
            </li>
            <li>
              the Website user may change their Cookie settings at any time –
              detailed information on the options and ways of handling Cookies
              is available in the software (web browser) settings. Example
              options for editing settings in popular browsers:
            </li>
          </ol>
          <ul>
            <li>
              Mozilla Firefox:{' '}
              <Link href="https://support.mozilla.org/kb/cookies">
                https://support.mozilla.org/kb/cookies
              </Link>
            </li>
            <li>
              Internet Explorer:{' '}
              <Link href="http://www.support.microsoft.com/kb/278835">
                http://www.support.microsoft.com/kb/278835
              </Link>
            </li>
            <li>
              Edge:{' '}
              <Link href="https://privacy.microsoft.com/windows-10-microsoft-edge-and-privacy">
                https://privacy.microsoft.com/windows-10-microsoft-edge-and-privacy
              </Link>
            </li>
            <li>
              Google Chrome:{' '}
              <Link href="https://support.google.com/chrome/answer/95647">
                https://support.google.com/chrome/answer/95647
              </Link>
            </li>
            <li>
              Opera:{' '}
              <Link href="https://help.opera.com/latest/web-preferences/#cookies">
                https://help.opera.com/latest/web-preferences/#cookies
              </Link>
              .
            </li>
          </ul>
        </div>
      </article>
    </Wrapper>
  )
}
