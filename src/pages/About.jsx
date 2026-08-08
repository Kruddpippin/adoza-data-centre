import { StaticPageLayout } from "@/components/StaticPageLayout";

const TRAINING_AREAS = [
  "Computer appreciation and digital literacy",
  "Microsoft Office and other productivity tools",
  "Data entry and data management",
  "Digital research and information management",
  "Graphic design",
  "Digital marketing",
  "Social media management",
  "Website development and basic programming",
  "Information and communication technology",
  "Entrepreneurship and business management",
  "Remote work and digital employment opportunities",
  "Financial and business literacy",
  "Other emerging technology-related skills",
];

const INFRASTRUCTURE = [
  "Modern laptops and desktop computers",
  "High-speed internet connectivity",
  "Reliable networking infrastructure",
  "Printers and scanners",
  "Data storage and backup systems",
  "Modern communication equipment",
  "Projectors and digital training facilities",
  "Power backup systems",
  "Appropriate cybersecurity and data-protection measures",
  "Relevant software and productivity applications",
  "Other emerging technologies necessary for efficient operations",
];

const EXPECTED_IMPACT = [
  "Establish a functional digital data centre in each Local Government Area of Kogi Central.",
  "Create a reliable database of Kogi Central indigenes and their skills, qualifications, and areas of need.",
  "Improve the identification and selection of genuine beneficiaries of empowerment programmes.",
  "Connect qualified youths and other residents with employment opportunities.",
  "Provide young people with practical digital and entrepreneurial skills.",
  "Increase access to computers, laptops, internet connectivity, and modern technology.",
  "Promote digital entrepreneurship and remote employment opportunities.",
  "Support evidence-based planning and development across Kogi Central.",
  "Create community-based digital hubs capable of supporting future technology initiatives.",
  "Build a pool of skilled and digitally competent young people capable of participating in the modern economy.",
];

function ChecklistGrid({ items }) {
  return (
    <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2.5">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
          {item}
        </li>
      ))}
    </ul>
  );
}

export default function About() {
  return (
    <StaticPageLayout
      title="ADOZA Data Centre Initiative"
      subtitle="A Digital Data, Empowerment, Employment and Youth Development Programme for Kogi Central"
    >
      <section>
        <h2 className="font-display text-lg font-semibold">1. Establishment of Adoza Data Centres Across Kogi Central</h2>
        <p className="mt-2">
          The Adoza Data Centre Initiative is conceived as a comprehensive digital development and empowerment
          programme designed to create a reliable data-driven platform for identifying the needs, skills,
          capacities, and economic opportunities available to the people of Kogi Central.
        </p>
        <p className="mt-3">
          As part of the initiative, a dedicated Adoza Data Centre will be established in each Local Government
          Area within Kogi Central. These centres will serve as community-based digital and information hubs
          where data can be collected, processed, stored, analysed, and utilised for effective planning and
          targeted intervention.
        </p>
        <p className="mt-3">
          Each Data Centre will be equipped with modern technological infrastructure, including laptops and
          desktop computers, internet facilities, data storage systems, networking equipment, printers,
          communication devices, and other relevant digital tools required for efficient operations.
        </p>
        <p className="mt-3">
          The centres will also be periodically upgraded with up-to-date technology and modern equipment to
          ensure that they remain relevant, functional, and capable of supporting contemporary digital,
          educational, employment, and entrepreneurial activities.
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold">2. Comprehensive Data Collection Across Local Government Areas</h2>
        <p className="mt-2">
          A major component of the Adoza Data Centre Initiative will be the systematic collection and collation
          of socio-economic and demographic data from across the Local Government Areas in Kogi Central.
        </p>
        <p className="mt-3">
          The initiative will establish a structured database containing relevant information about individuals
          and communities, including available skills, educational qualifications, professional backgrounds,
          areas of interest, entrepreneurial activities, employment status, business needs, and other
          information necessary for development planning.
        </p>
        <p className="mt-3">
          The data will be collected responsibly and managed in accordance with applicable data protection and
          privacy requirements. The objective is to create an accurate and reliable information base that can
          assist in identifying genuine needs and opportunities across the various communities.
        </p>
        <p className="mt-3">
          This data-driven approach will make it possible to move away from generalised interventions and
          towards targeted, evidence-based empowerment and development programmes.
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold">3. Kogi Central Indigenes Empowerment and Employment Database</h2>
        <p className="mt-2">
          The initiative will establish a centralised database of Kogi Central indigenes, particularly youths,
          graduates, entrepreneurs, skilled workers, professionals, artisans, and other members of the community
          who may benefit from employment, training, grants, business opportunities, internships, scholarships,
          or other empowerment programmes.
        </p>
        <p className="mt-3">
          Through the database, individuals can be properly identified according to their qualifications,
          skills, interests, experience, location, and areas of need.
        </p>
        <p className="mt-3">
          This will enable available empowerment and employment resources to be channelled to the appropriate
          beneficiaries in a transparent and structured manner.
        </p>
        <p className="mt-3">
          For example, where an employment opportunity requires individuals with specific qualifications or
          skills, the database can assist in identifying suitable candidates. Similarly, where a training or
          business-support programme is available, potential beneficiaries can be identified based on
          predetermined eligibility criteria.
        </p>
        <p className="mt-3">
          The ultimate goal is to create a system where opportunities can be matched with the right people,
          thereby improving the effectiveness and reach of empowerment programmes across Kogi Central.
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold">4. Youth Training, Digital Skills and Capacity Development</h2>
        <p className="mt-2">
          The Adoza Data Centre Initiative will place significant emphasis on youth development and digital
          skills acquisition. Each Data Centre will serve as a training hub where young people can receive
          practical training in areas such as:
        </p>
        <ChecklistGrid items={TRAINING_AREAS} />
        <p className="mt-3">
          The programme will not merely provide theoretical instruction. Participants will be given access to
          the necessary technological facilities to learn, practise, and develop marketable skills.
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold">5. Provision of Laptops and Training Equipment</h2>
        <p className="mt-2">
          To ensure that the training component of the initiative produces practical results, laptops will be
          provided as part of the training infrastructure.
        </p>
        <p className="mt-3">
          The laptops will enable participants to receive hands-on training and develop practical competence in
          the use of modern digital tools. Training sessions will be structured to allow participants to work on
          practical assignments, projects, data management exercises, digital entrepreneurship activities, and
          other relevant tasks.
        </p>
        <p className="mt-3">
          Where appropriate, the programme may also provide selected participants with access to laptops or
          other digital devices through structured training or empowerment arrangements, subject to the
          applicable programme guidelines.
        </p>
        <p className="mt-3">
          The Data Centres themselves will be equipped with sufficient computers and other technological devices
          to support both training and administrative operations.
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold">6. Modern Technology and Infrastructure</h2>
        <p className="mt-2">
          Each Adoza Data Centre will be designed as a modern digital hub rather than simply an office for data
          collection. The centres will be equipped, subject to available resources, with:
        </p>
        <ChecklistGrid items={INFRASTRUCTURE} />
        <p className="mt-3">
          The technology and equipment deployed at the centres will be regularly reviewed and upgraded to
          prevent the facilities from becoming obsolete and to ensure that beneficiaries have access to tools
          that reflect current industry standards.
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold">7. Employment and Economic Opportunities</h2>
        <p className="mt-2">
          The Adoza Data Centre Initiative will also function as a platform for connecting qualified individuals
          with employment and economic opportunities.
        </p>
        <p className="mt-3">
          By maintaining an organised database of skills and qualifications across Kogi Central, the programme
          can help identify suitable candidates for available opportunities from government institutions,
          private organisations, businesses, development partners, NGOs, and other stakeholders.
        </p>
        <p className="mt-3">
          The initiative can also support young entrepreneurs by identifying their businesses, skills,
          challenges, and areas requiring intervention.
        </p>
        <p className="mt-3">
          Through this approach, the Data Centres can become an important bridge between people, opportunities,
          employers, investors, training providers, and empowerment programmes.
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold">8. Community-Based Development and Accountability</h2>
        <p className="mt-2">
          Having a Data Centre in each Local Government Area will bring the programme closer to the people and
          make it easier to identify the specific needs of different communities.
        </p>
        <p className="mt-3">
          Rather than relying solely on centralised information, the initiative will generate local-level data
          that can reveal the particular challenges, skills, resources, and opportunities existing within each
          Local Government Area.
        </p>
        <p className="mt-3">
          This information can subsequently be used to support better planning, resource allocation, programme
          design, monitoring, and evaluation.
        </p>
        <p className="mt-3">
          The initiative will therefore promote a culture of data-driven development, transparency, inclusion,
          and accountability.
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold">9. Expected Impact</h2>
        <p className="mt-2">The Adoza Data Centre Initiative is expected to:</p>
        <ol className="mt-2 list-decimal space-y-1.5 pl-5">
          {EXPECTED_IMPACT.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold">10. Long-Term Vision</h2>
        <p className="mt-2">
          The long-term vision of the Adoza Data Centre Initiative is to establish Kogi Central as a digitally
          connected and data-driven region where every Local Government Area has access to modern digital
          infrastructure, reliable information, skills development opportunities, and pathways to employment and
          economic empowerment.
        </p>
        <p className="mt-3">
          The initiative seeks to ensure that technology is not concentrated only in major urban centres but is
          brought directly into communities, particularly to young people who can use digital skills to create
          employment, build businesses, access global opportunities, and contribute meaningfully to the
          development of Kogi Central.
        </p>
        <p className="mt-3">
          Ultimately, the Adoza Data Centre will serve not only as a data collection centre, but as a digital
          learning hub, employment and empowerment platform, community information centre, entrepreneurship
          support facility, and catalyst for sustainable youth development across Kogi Central.
        </p>
      </section>
    </StaticPageLayout>
  );
}
