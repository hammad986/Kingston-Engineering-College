import os
import urllib.request
import ssl
import re

# Disable SSL verification for those pesky college servers
ssl._create_default_https_context = ssl._create_unverified_context

def download_pdf(url, dest_path):
    print(f"Downloading {url} to {dest_path}...")
    headers = {'User-Agent': 'Mozilla/5.0'}
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=30) as response, open(dest_path, 'wb') as out_file:
            out_file.write(response.read())
        print("Success.")
        return True
    except Exception as e:
        print(f"Failed to download {url}: {e}")
        return False

# Setup directories
pdf_dir = "assets/pdf/alumni"
if not os.path.exists(pdf_dir):
    os.makedirs(pdf_dir)

# PDF URLs
pdfs = {
    "Alumni_Cell_Member_List.pdf": "https://engineering.kingston.ac.in/assets/pdf/club-event/cell/Alumni.pdf",
    "Alumni_Association_Registration_Certificate.pdf": "https://engineering.kingston.ac.in/assets/pdf/alumini/Alumni%20Association%20Registration%20Certificate.pdf"
}

for filename, url in pdfs.items():
    download_pdf(url, os.path.join(pdf_dir, filename))

# Load template
try:
    with open("about.html", "r", encoding="utf-8") as f:
        template = f.read()
except:
    with open("index.html", "r", encoding="utf-8") as f:
        template = f.read()

def get_pdf_wrapper(title, pdf_path):
    # PDF Wrapper template matching the UGC/IQAC style
    wrapper = template
    
    # Hide original content
    content_regex = r'<!-- (?:Why Choose Kingston|Vision & Mission|Achievements|Departments Grid|Academics) .*?-->(.*?)<!-- Footer -->'
    # Instead of regex which might fail, let's just replace the main section
    
    main_section = """
    <section class="pdf-viewer-section" style="padding: 100px 0; background: #f4f4f4; min-height: 80vh;">
        <div class="container">
            <div class="section-header text-center mb-10" data-aos="fade-up">
                <h2 style="color: #8b1a2b; font-size: 2.5rem; margin-bottom: 20px;">{TITLE}</h2>
                <div style="width: 80px; height: 4px; background: #ffd700; margin: 0 auto 30px;"></div>
            </div>
            <div class="pdf-container" data-aos="zoom-in" data-aos-delay="200" style="box-shadow: 0 15px 35px rgba(0,0,0,0.2); border-radius: 12px; overflow: hidden; background: #fff;">
                <iframe src="{PDF_URL}" width="100%" height="900px" style="border: none;"></iframe>
            </div>
            <div class="text-center mt-8" data-aos="fade-up">
                <a href="{PDF_URL}" target="_blank" class="btn-more-details" style="background: #8b1a2b; color: #fff; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Download PDF</a>
            </div>
        </div>
    </section>
    """.replace("{TITLE}", title).replace("{PDF_URL}", pdf_path)

    # Use a more robust replacement for the main content
    # Look for the end of navigation and start of footer
    nav_end = template.find('</nav>') + 6
    footer_start = template.find('<footer')
    
    if nav_end > 5 and footer_start > 0:
        new_page = template[:nav_end] + main_section + template[footer_start:]
    else:
        new_page = template # Fallback
        
    return new_page

# Generate Wrappers
with open("alumni_cell_members.html", "w", encoding="utf-8") as f:
    f.write(get_pdf_wrapper("Alumni Cell Member List", "assets/pdfs/alumni/Alumni_Cell_Member_List.pdf"))

with open("alumni_registration.html", "w", encoding="utf-8") as f:
    f.write(get_pdf_wrapper("Alumni Association Registration Certificate", "assets/pdfs/alumni/Alumni_Association_Registration_Certificate.pdf"))

# Generate Main Alumni Page
alumni_content = """
<style>
    .alumni-tabs-container { padding: 80px 0; background: #fdfdfd; }
    .tabs-nav { display: flex; justify-content: center; gap: 15px; margin-bottom: 50px; flex-wrap: wrap; }
    .tab-btn { 
        padding: 12px 25px; background: #fff; border: 2px solid #8b1a2b; color: #8b1a2b; 
        font-weight: 600; cursor: pointer; border-radius: 50px; transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(0,0,0,0.05);
    }
    .tab-btn.active { background: #8b1a2b; color: #fff; box-shadow: 0 8px 20px rgba(139, 26, 43, 0.3); transform: translateY(-3px); }
    .tab-content { display: none; max-width: 1000px; margin: 0 auto; animation: fadeIn 0.5s ease; }
    .tab-content.active { display: block; }
    
    @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    
    .alumni-card { background: #fff; padding: 30px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.08); margin-bottom: 30px; border-left: 5px solid #ffd700; transition: transform 0.3s; }
    .alumni-card:hover { transform: scale(1.02); }
    .alumni-card h3 { color: #8b1a2b; margin-bottom: 15px; font-size: 1.5rem; border-bottom: 1px solid #eee; padding-bottom: 10px; }
    
    .executive-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
    .member-box { background: #fcf4f5; padding: 20px; border-radius: 10px; border: 1px solid #eecaca; transition: 0.3s; }
    .member-box:hover { background: #8b1a2b; color: #fff; }
    .member-box:hover h4 { color: #ffd700; }
    .member-box h4 { color: #8b1a2b; margin-bottom: 5px; transition: 0.3s; }

    .event-item { position: relative; padding-left: 30px; margin-bottom: 25px; border-left: 2px solid #8b1a2b; }
    .event-item::before { content: ''; position: absolute; left: -9px; top: 0; width: 16px; height: 16px; background: #ffd700; border-radius: 50%; border: 3px solid #8b1a2b; }
    .event-date { font-weight: bold; color: #8b1a2b; font-size: 0.9rem; text-transform: uppercase; }
    
    .link-pill { display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #8b1a2b, #b31d35); color: #fff; text-decoration: none; border-radius: 10px; margin: 10px; font-weight: 600; box-shadow: 0 5px 15px rgba(0,0,0,0.2); transition: 0.3s; }
    .link-pill:hover { transform: translateY(-5px); box-shadow: 0 10px 25px rgba(0,0,0,0.3); color: #ffd700; }
</style>

<section class="alumni-tabs-container">
    <div class="container">
        <div class="section-header text-center mb-16" data-aos="fade-up">
            <h1 style="color: #8b1a2b; font-size: 3rem; margin-bottom: 10px;">Alumni Association</h1>
            <p style="color: #666; font-size: 1.1rem;">Nurturing Bonds, Inspiring Futures</p>
            <div style="width: 100px; height: 5px; background: #ffd700; margin: 20px auto;"></div>
        </div>

        <div class="tabs-nav" data-aos="fade-up" data-aos-delay="200">
            <button class="tab-btn active" onclick="openTab(event, 'about')">About</button>
            <button class="tab-btn" onclick="openTab(event, 'executives')">Executive Members</button>
            <button class="tab-btn" onclick="openTab(event, 'registration')">Registration</button>
            <button class="tab-btn" onclick="openTab(event, 'events')">Alumni Events</button>
            <button class="tab-btn" onclick="openTab(event, 'links')">Quick Links</button>
        </div>

        <!-- About Tab -->
        <div id="about" class="tab-content active">
            <div class="alumni-card" data-aos="fade-right">
                <h3>Visions & Missions</h3>
                <p>The Kingston Engineering College Alumni Association aims to create a lifelong and worldwide community of alumni through increased opportunities for meaningful engagement in order to increase awareness, pride, participation, volunteer involvement, and philanthropic commitment to Kingston Engineering College.</p>
            </div>
            <div class="alumni-card" data-aos="fade-left" data-aos-delay="100">
                <h3>Objectives of the Society</h3>
                <ul style="list-style: none; padding: 0;">
                    <li style="margin-bottom: 15px;"><i class="fas fa-check-circle" style="color: #8b1a2b; margin-right: 10px;"></i> To conduct / sponsor Career Guidance Programme for students.</li>
                    <li style="margin-bottom: 15px;"><i class="fas fa-check-circle" style="color: #8b1a2b; margin-right: 10px;"></i> To create new avenues for interaction of students, faculty with industry.</li>
                    <li style="margin-bottom: 15px;"><i class="fas fa-check-circle" style="color: #8b1a2b; margin-right: 10px;"></i> To assist disabled students with necessary gadgets, aids, and counselling.</li>
                    <li style="margin-bottom: 15px;"><i class="fas fa-check-circle" style="color: #8b1a2b; margin-right: 10px;"></i> To conduct seminars, conferences for promotion of knowledge.</li>
                    <li style="margin-bottom: 15px;"><i class="fas fa-check-circle" style="color: #8b1a2b; margin-right: 10px;"></i> To organize and coordinate reunion activities.</li>
                </ul>
            </div>
            <div class="alumni-card" data-aos="zoom-in" data-aos-delay="200" style="background: #8b1a2b; color: #fff; border-left-color: #ffd700;">
                <h3 style="color: #ffd700;">Distinguished Alumni Award</h3>
                <p>A distinguished Alumni award is given for excellence in fields like Research, Entrepreneurship, Sports, Arts, and Social Service.</p>
            </div>
        </div>

        <!-- Executives Tab -->
        <div id="executives" class="tab-content">
            <div class="alumni-card" style="border-left-color: #8b1a2b;">
                <h3>Alumni Cell Member List</h3>
                <p>Click below to view the full list of our esteemed cell members.</p>
                <a href="alumni_cell_members.html" class="btn-more-details" style="display:inline-block; margin-top: 10px;">View Member List (PDF)</a>
            </div>
            <div class="executive-grid">
                <div class="member-box">
                    <h4>President</h4>
                    <p>Mr. D. Praveen Kumar</p>
                </div>
                <div class="member-box">
                    <h4>Secretary</h4>
                    <p>Mr. S. Vignesh</p>
                </div>
                <div class="member-box">
                    <h4>Treasurer</h4>
                    <p>Mr. R. Karthikeyan</p>
                </div>
            </div>
        </div>

        <!-- Registration Tab -->
        <div id="registration" class="tab-content">
            <div class="alumni-card">
                <h3>Registration Details</h3>
                <p>Official Registration Number: <strong>SRG/Velur/45/2023</strong></p>
                <p>Ensuring transparency and official recognition for our global network.</p>
                <div style="margin-top: 25px;">
                    <a href="alumni_registration.html" class="btn-more-details">View Registration Certificate (PDF)</a>
                </div>
            </div>
        </div>

        <!-- Events Tab -->
        <div id="events" class="tab-content">
            <div class="alumni-card">
                <h3>Past Activities (2023-24)</h3>
                <div class="event-item">
                    <div class="event-date">Technology Day 2023</div>
                    <p>Lecture Series by Mrs Mukundha Shree (Lead Business Analyst, MSC Technology).</p>
                </div>
                <div class="event-item">
                    <div class="event-date">Workshop: Game Dev</div>
                    <p>Unity Engine Workshop by Mr G Aswin Raj (Rythmos India).</p>
                </div>
                <div class="event-item">
                    <div class="event-date">Webinar: Career Planning</div>
                    <p>Supply Chain Insights by Ms. Lingapoorani (TCS).</p>
                </div>
                <div class="event-item">
                    <div class="event-date">Training: Industry 4.0</div>
                    <p>Additive Manufacturing by Mr. G. Agiesh Ashok (Inzaneone Tech).</p>
                </div>
            </div>
        </div>

        <!-- Links Tab -->
        <div id="links" class="tab-content text-center">
            <div class="alumni-card">
                <h3>Stay Connected</h3>
                <p>We value your feedback and would love to have you registered in our network.</p>
                <div style="margin-top: 30px;">
                    <a href="https://forms.gle/TWF1jBYhyKJPDtAW9" target="_blank" class="link-pill"><i class="fas fa-user-plus"></i> Alumni Registration Form</a>
                    <a href="https://forms.gle/2x5eeKPgngivoLUr9" target="_blank" class="link-pill"><i class="fas fa-comment-dots"></i> Alumni Feedback Form</a>
                </div>
            </div>
        </div>

    </div>
</section>

<script>
    function openTab(evt, tabName) {
        var i, tabcontent, tablinks;
        tabcontent = document.getElementsByClassName("tab-content");
        for (i = 0; i < tabcontent.length; i++) {
            tabcontent[i].style.display = "none";
            tabcontent[i].classList.remove("active");
        }
        tablinks = document.getElementsByClassName("tab-btn");
        for (i = 0; i < tablinks.length; i++) {
            tablinks[i].className = tablinks[i].className.replace(" active", "");
        }
        document.getElementById(tabName).style.display = "block";
        document.getElementById(tabName).classList.add("active");
        evt.currentTarget.className += " active";
        
        // Refresh AOS if animations are inside tabs
        if(typeof AOS !== 'undefined') {
            AOS.refresh();
        }
    }
</script>
"""

# Assemble alumni.html
nav_end = template.find('</nav>') + 6
footer_start = template.find('<footer')
new_alumni_page = template[:nav_end] + alumni_content + template[footer_start:]

with open("alumni.html", "w", encoding="utf-8") as f:
    f.write(new_alumni_page)

print("Alumni pages generated successfully.")

# Update navigation globally
nav_pages = ["index.html", "about.html", "departments.html", "academics.html", "facilities.html", "alumni.html", 
             "alumni_cell_members.html", "alumni_registration.html"]

# Find all generated pages to update them too
for filename in os.listdir('.'):
    if filename.endswith('.html') and (filename.startswith('about_') or filename.startswith('placement_') or filename.startswith('iqac_') or filename.startswith('naac_') or filename.startswith('ugc_')):
        nav_pages.append(filename)

# Unique list
nav_pages = list(set(nav_pages))

# Regex for Top Bar Alumni link
alumni_top_regex = r'<a href="[^"]*">Alumni</a>'
alumni_top_replacement = '<a href="alumni.html">Alumni</a>'

# Regex for Main Nav Alumni link (in case it's there)
alumni_nav_regex = r'<li><a href="[^"]*">Alumni</a></li>'
alumni_nav_replacement = '<li><a href="alumni.html">Alumni</a></li>'

# Also ensure "Contact Us" and "Picture Gallery" are removed as per user preference
contact_us_regex = r'<li><a href="index\.html">Contact Us</a></li>'
contact_us_replacement = '<!-- Contact Us Menu replacement -->'

picture_gallery_regex = r'<li><a href="[^"]*">Picture Gallery</a></li>'
picture_gallery_replacement = '<!-- Picture Gallery Menu replacement -->'

for page in nav_pages:
    if os.path.exists(page):
        with open(page, "r", encoding="utf-8") as f:
            content = f.read()
        
        new_content = re.sub(alumni_top_regex, alumni_top_replacement, content)
        new_content = re.sub(alumni_nav_regex, alumni_nav_replacement, new_content)
        new_content = re.sub(contact_us_regex, contact_us_replacement, new_content)
        new_content = re.sub(picture_gallery_regex, picture_gallery_replacement, new_content)
        
        if new_content != content:
            with open(page, "w", encoding="utf-8") as f:
                f.write(new_content)
            # print(f"Updated nav in {page}")

print("Global navigation updated.")
