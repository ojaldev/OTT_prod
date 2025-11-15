import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Content, CreateContentData } from '../../types/Content';
import { contentService } from '../../services/content';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import { PLATFORMS, GENRES, LANGUAGES, FORMATS, AGE_RATINGS, SOURCES } from '../../utils/constants';

interface ContentFormProps {
  content?: Content;
  onSubmit: (data: CreateContentData) => void;
  onCancel: () => void;
  loading?: boolean;
}

const ContentForm: React.FC<ContentFormProps> = ({
  content,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const [isDuplicateChecking, setIsDuplicateChecking] = useState(false);
  const [duplicateError, setDuplicateError] = useState<string | null>(null);
  const [lastFetchedId, setLastFetchedId] = useState<string | null>(null);

  const { register, control, handleSubmit, watch, formState: { errors }, setError, reset } = useForm<CreateContentData>({
    defaultValues: {
      platform: '',
      title: '',
      primaryLanguage: '',
      year: new Date().getFullYear(),
      assignedGenre: '',
      assignedFormat: '',
      selfDeclaredGenre: '',
      selfDeclaredFormat: '',
      source: 'TBD',
      ageRating: 'Not Rated',
      seasons: undefined,
      episodes: undefined,
      durationHours: undefined,
      releaseDate: undefined,
      sourceFlags: { inHouse: false, commissioned: false, coProduction: false },
      dubbing: {
        tamil: false, telugu: false, kannada: false, malayalam: false, hindi: false,
        punjabi: false, bengali: false, marathi: false, bhojpuri: false, gujarati: false,
        english: false, haryanvi: false, rajasthani: false, deccani: false, arabic: false
      }
    }
  });

  const watchedPlatform = watch('platform');
  const watchedTitle = watch('title');
  const watchedYear = watch('year');

  // Fetch full content details in edit mode, or reset the form in add mode
  useEffect(() => {
    if (content?._id && content._id !== lastFetchedId) {
      const fetchContentDetails = async () => {
        try {
          console.log('🔄 Fetching content details for ID:', content._id);
          const response = await contentService.getContentById(content._id);
          const fullContent = response.data;

          // Format the release date for the input[type="date"]
          if (fullContent.releaseDate) {
            fullContent.releaseDate = new Date(fullContent.releaseDate).toISOString().split('T')[0] as any;
          }

          console.log('📝 Full content data before reset:', fullContent);
          
          // Extract only the form fields we need
          const formData: CreateContentData = {
            platform: fullContent.platform,
            title: fullContent.title,
            selfDeclaredGenre: fullContent.selfDeclaredGenre,
            assignedGenre: fullContent.assignedGenre,
            primaryLanguage: fullContent.primaryLanguage,
            selfDeclaredFormat: fullContent.selfDeclaredFormat,
            assignedFormat: fullContent.assignedFormat,
            year: fullContent.year,
            releaseDate: fullContent.releaseDate,
            seasons: fullContent.seasons,
            episodes: fullContent.episodes,
            durationHours: fullContent.durationHours,
            source: fullContent.source,
            ageRating: fullContent.ageRating,
            sourceFlags: fullContent.sourceFlags,
            dubbing: fullContent.dubbing
          };

          console.log('📝 Form data to reset:', formData);
          reset(formData);
          setLastFetchedId(content._id);
          console.log('✅ Form reset complete');
          
          // Debug: Check form values after reset
          setTimeout(() => {
            console.log('🔍 Form values after reset:', watch());
          }, 100);
        } catch (err) {
          console.error("Failed to fetch complete content data.", err);
        }
      };
      fetchContentDetails();
    } else if (!content) {
      // Reset form to default blank state for 'Add New' mode
      console.log('🆕 Resetting form to blank state');
      reset({
        platform: '',
        title: '',
        primaryLanguage: '',
        year: new Date().getFullYear(),
        assignedGenre: '',
        assignedFormat: '',
        source: 'TBD',
        ageRating: 'Not Rated',
        sourceFlags: { inHouse: false, commissioned: false, coProduction: false },
        dubbing: {
          tamil: false, telugu: false, kannada: false, malayalam: false, hindi: false,
          punjabi: false, bengali: false, marathi: false, bhojpuri: false, gujarati: false,
          english: false, haryanvi: false, rajasthani: false, deccani: false, arabic: false
        }
      });
      setLastFetchedId(null);
    }
  }, [content, lastFetchedId]);

  // Check for duplicates when key fields change in create mode
  useEffect(() => {
    if (watchedPlatform && watchedTitle && watchedYear && !content) {
      checkDuplicate();
    }
  }, [watchedPlatform, watchedTitle, watchedYear, content]);

  const checkDuplicate = async () => {
    if (!watchedPlatform || !watchedTitle || !watchedYear) return;

    try {
      setIsDuplicateChecking(true);
      setDuplicateError(null);

      const result = await contentService.checkDuplicate(
        watchedPlatform,
        watchedTitle,
        watchedYear
      );

      if (result.exists) {
        setDuplicateError('Content with same platform, title and year already exists');
        setError('title', {
          type: 'duplicate',
          message: 'Duplicate content found'
        });
      }
    } catch (error) {
      console.error('Duplicate check failed:', error);
    } finally {
      setIsDuplicateChecking(false);
    }
  };

  const handleFormSubmit = (data: CreateContentData) => {
    if (duplicateError && !content) {
      return;
    }
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md transition-colors duration-200">
        <h3 className="text-lg font-semibold mb-6 text-gray-900 dark:text-gray-100">
          {content ? 'Edit Content' : 'Add New Content'}
        </h3>

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <Controller
            name="platform"
            control={control}
            rules={{ required: 'Platform is required' }}
            render={({ field }) => (
              <Select
                {...field}
                placeholder="Select Platform"
                options={PLATFORMS.map(p => ({ value: p, label: p }))}
                error={errors.platform?.message}
                label="Platform *"
              />
            )}
          />

          <Input
            {...register('title', { required: 'Title is required' })}
            label="Title *"
            error={errors.title?.message}
            disabled={isDuplicateChecking}
          />

          <Input
            {...register('year', {
              required: 'Year is required',
              min: { value: 1900, message: 'Year must be after 1900' },
              max: { value: 2030, message: 'Year cannot be beyond 2030' }
            })}
            type="number"
            label="Year *"
            error={errors.year?.message}
          />
        </div>

        {/* Duplicate Warning */}
        {duplicateError && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-red-600 dark:text-red-400 text-sm font-medium">{duplicateError}</p>
          </div>
        )}

        {/* Genre and Format */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Input
            {...register('selfDeclaredGenre')}
            label="Self Declared Genre"
          />

          <Controller
            name="assignedGenre"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                placeholder="Select Genre"
                options={GENRES.map(g => ({ value: g, label: g }))}
                label="Assigned Genre"
              />
            )}
          />

          <Input
            {...register('selfDeclaredFormat')}
            label="Self Declared Format"
          />

          <Controller
            name="assignedFormat"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                placeholder="Select Format"
                options={FORMATS.map(f => ({ value: f, label: f }))}
                label="Assigned Format"
              />
            )}
          />
        </div>

        {/* Language and Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Controller
            name="primaryLanguage"
            control={control}
            rules={{ required: 'Primary language is required' }}
            render={({ field }) => (
              <Select
                {...field}
                placeholder="Select Language"
                options={LANGUAGES.map(l => ({ value: l, label: l }))}
                error={errors.primaryLanguage?.message}
                label="Primary Language *"
              />
            )}
          />

          <Input
            {...register('seasons', { min: 0 })}
            type="number"
            label="Seasons"
            min="0"
          />

          <Input
            {...register('episodes', { min: 0 })}
            type="number"
            label="Episodes"
            min="0"
          />

          <Input
            {...register('durationHours')}
            type="number"
            step="0.01"
            label="Duration (Hours)"
          />
        </div>

        {/* Source and Rating */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Controller
            name="source"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                placeholder="Select Source"
                options={SOURCES.map(s => ({ value: s, label: s }))}
                label="Source"
              />
            )}
          />

          <Controller
            name="ageRating"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                placeholder="Select Rating"
                options={AGE_RATINGS.map(r => ({ value: r, label: r }))}
                label="Age Rating"
              />
            )}
          />

          <Input
            {...register('releaseDate')}
            type="date"
            label="Release Date"
          />
        </div>

        {/* Source Flags */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Source Flags
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                {...register('sourceFlags.inHouse')}
                className="rounded border-gray-300 dark:border-gray-600 text-blue-600 dark:text-blue-500 focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-700"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">In-House</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                {...register('sourceFlags.commissioned')}
                className="rounded border-gray-300 dark:border-gray-600 text-blue-600 dark:text-blue-500 focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-700"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Commissioned</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                {...register('sourceFlags.coProduction')}
                className="rounded border-gray-300 dark:border-gray-600 text-blue-600 dark:text-blue-500 focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-700"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Co-Production</span>
            </label>
          </div>
        </div>

        {/* Dubbing Languages */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Dubbing Languages
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {Object.keys(watch('dubbing') || {}).map((language) => (
              <label key={language} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  {...register(`dubbing.${language}` as any)}
                  className="rounded border-gray-300 dark:border-gray-600 text-blue-600 dark:text-blue-500 focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-700"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                  {language === 'malayalam' ? 'Malayalam' : language}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={loading}
            disabled={!!duplicateError && !content}
          >
            {content ? 'Update' : 'Create'} Content
          </Button>
        </div>
      </div>
    </form>
  );
};

export default ContentForm;
