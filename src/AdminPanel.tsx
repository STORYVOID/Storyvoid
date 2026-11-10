
import React, { useState } from 'react';
import { AddEpisodeTab } from './components/admin/AddEpisodeTab';
import { NewStoryTab } from './components/admin/NewStoryTab';
import { AdminUsersTab } from './components/AdminUsersTab';
import { AdminManageTab } from './components/AdminManageTab';

interface AdminPanelProps {
  stories: any[];
  fetchStories: () => void;
  setSuccessMessage: (msg: string) => void;
}

type AdminTab =
  | 'episode'
  | 'story'
  | 'banner'
  | 'promo'
  | 'users'
  | 'manage';

export const AdminPanel: React.FC<AdminPanelProps> = ({
  stories,
  fetchStories,
  setSuccessMessage,
}) => {
  const [activeAdminTab, setActiveAdminTab] =
    useState<AdminTab>('episode');

  const [featuredTitle, setFeaturedTitle] = useState(
    localStorage.getItem('storyvoid_featured_title') || ''
  );

  const [customBannerImg, setCustomBannerImg] = useState(
    localStorage.getItem('storyvoid_custom_banner_image') || ''
  );

  const [promoTitle, setPromoTitle] = useState(
    localStorage.getItem('storyvoid_promo_title') || ''
  );

  const [promoMediaUrl, setPromoMediaUrl] = useState(
    localStorage.getItem('storyvoid_promo_media') || ''
  );

  const [promoLink, setPromoLink] = useState(
    localStorage.getItem('storyvoid_promo_link') || ''
  );

  const uniqueSeriesNames = Array.from(
    new Set(stories.map((story) => story.title))
  );

  const handleSaveBanner = (e: React.FormEvent) => {
    e.preventDefault();

    localStorage.setItem(
      'storyvoid_featured_title',
      featuredTitle
    );

    localStorage.setItem(
      'storyvoid_custom_banner_image',
      customBannerImg
    );

    setSuccessMessage('Featured banner updated successfully!');
  };

  const handleSavePromoBanner = (e: React.FormEvent) => {
    e.preventDefault();

    localStorage.setItem(
      'storyvoid_promo_title',
      promoTitle
    );

    localStorage.setItem(
      'storyvoid_promo_media',
      promoMediaUrl
    );

    localStorage.setItem(
      'storyvoid_promo_link',
      promoLink
    );

    setSuccessMessage('Promotional banner updated successfully!');
  };

  const tabClass = (tab: AdminTab) =>
    `py-2 px-3 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
      activeAdminTab === tab
        ? 'bg-orange-500 text-white shadow-md'
        : 'bg-[#16131c] text-gray-400 border border-gray-800'
    }`;

  return (
    <div className="space-y-4 max-w-xl mx-auto px-3 pb-12">

      <div className="bg-[#16131c] p-4 rounded-2xl border border-gray-800 text-center shadow-lg">
        <h2 className="text-sm font-black text-orange-500 uppercase tracking-wider">
          🛠️ STORYVOID ADMIN COMMAND CENTER
        </h2>
        <p className="text-[10px] text-gray-400 mt-0.5">
          Manage your audio series, featured banners & users
        </p>
      </div>

      <div className="flex overflow-x-auto space-x-2 pb-1 scrollbar-none">

        <button
          onClick={() => setActiveAdminTab('episode')}
          className={tabClass('episode')}
        >
          + Episode
        </button>

        <button
          onClick={() => setActiveAdminTab('story')}
          className={tabClass('story')}
        >
          + New Story
        </button>

        <button
          onClick={() => setActiveAdminTab('banner')}
          className={tabClass('banner')}
        >
          ⭐ Banner
        </button>

        <button
          onClick={() => setActiveAdminTab('promo')}
          className={tabClass('promo')}
        >
          📢 Promo Ads
        </button>

        <button
          onClick={() => setActiveAdminTab('users')}
          className={tabClass('users')}
        >
          👥 Users
        </button>

        <button
          onClick={() => setActiveAdminTab('manage')}
          className={tabClass('manage')}
        >
          ⚙️ Manage
        </button>

      </div>

      {activeAdminTab === 'episode' && (
        <AddEpisodeTab
          stories={stories}
          fetchStories={fetchStories}
          setSuccessMessage={setSuccessMessage}
        />
      )}

      {activeAdminTab === 'story' && (
        <NewStoryTab
          fetchStories={fetchStories}
          setSuccessMessage={setSuccessMessage}
        />
      )}

      {activeAdminTab === 'banner' && (
        <form
          onSubmit={handleSaveBanner}
          className="bg-[#16131c] p-4 rounded-2xl border border-gray-800 space-y-3 shadow-lg"
        >
          <h3 className="text-xs font-bold text-orange-400 uppercase tracking-wide">
            ⭐ Set Home Featured / Trending Banner
          </h3>

          <div>
            <label className="text-[10px] text-gray-400">
              Select Featured Story
            </label>

            <select
              value={featuredTitle}
              onChange={(e) => setFeaturedTitle(e.target.value)}
              className="w-full bg-[#121017] border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none mt-1"
            >
              <option value="">-- Choose Series --</option>

              {uniqueSeriesNames.map((name, idx) => (
                <option key={idx} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] text-gray-400">
              Custom Banner Image URL (Optional)
            </label>

            <input
              type="text"
              placeholder="https://..."
              value={customBannerImg}
              onChange={(e) => setCustomBannerImg(e.target.value)}
              className="w-full bg-[#121017] border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none mt-1"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-xl text-xs shadow-lg cursor-pointer transition-all"
          >
            ✨ Save Featured Banner
          </button>
        </form>
      )}

      {activeAdminTab === 'promo' && (
        <form
          onSubmit={handleSavePromoBanner}
          className="bg-[#16131c] p-4 rounded-2xl border border-gray-800 space-y-3 shadow-lg"
        >
          <h3 className="text-xs font-bold text-orange-400 uppercase tracking-wide">
            📢 Promotional / Social Ad Banner
          </h3>

          <div>
            <label className="text-[10px] text-gray-400">
              Banner / Ad Title
            </label>

            <input
              type="text"
              placeholder="e.g. Follow us on Instagram"
              value={promoTitle}
              onChange={(e) => setPromoTitle(e.target.value)}
              className="w-full bg-[#121017] border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none mt-1"
            />
          </div>

          <div>
            <label className="text-[10px] text-gray-400">
              Banner Image / Video Link URL
            </label>

            <input
              type="text"
              placeholder="https://... (Image or Video Link)"
              value={promoMediaUrl}
              onChange={(e) => setPromoMediaUrl(e.target.value)}
              className="w-full bg-[#121017] border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none mt-1"
            />
          </div>

          <div>
            <label className="text-[10px] text-gray-400">
              External Redirect Link (Instagram / YouTube)
            </label>

            <input
              type="text"
              placeholder="https://instagram.com/..."
              value={promoLink}
              onChange={(e) => setPromoLink(e.target.value)}
              className="w-full bg-[#121017] border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none mt-1"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-xl text-xs shadow-lg cursor-pointer transition-all"
          >
            🚀 Save Promotional Banner
          </button>
        </form>
      )}

      {activeAdminTab === 'users' && (
        <AdminUsersTab />
      )}

      {activeAdminTab === 'manage' && (
        <AdminManageTab
          stories={stories}
          fetchStories={fetchStories}
          setSuccessMessage={setSuccessMessage}
        />
      )}

    </div>
  );
};
        
